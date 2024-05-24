interface OperationObj {
    summary: any;
    operationId: any;
    parameters: any[];
    requestBody?: any;
    responses: {
        [x: number]:
        {
            description: string;
            content:
            {
                'application/json':
                {
                    schema: { $ref: string; };
                };
            };
        };
    };
}

function convertToValidDataType(input: string): { type: string, format?: string } {
    switch (input) {
        case 'boolean':
            return { type: 'boolean' };
        case 'date':
            return { type: 'string', format: 'date' };
        case 'time':
            return { type: 'string', format: 'time' };
        case 'dateTime':
            return { type: 'string', format: 'date-time' };
        case 'integer':
            return { type: 'integer' };
        case 'decimal':
            return { type: 'number', format: 'double' };
        case 'url':
            return { type: 'string', format: 'uri' };
        case 'string':
        case 'text':
            return { type: 'string' };
        default:
            return { type: 'object' };
    }
}

function hasDuplicate(parameters, name) {
    return parameters.some(param => param.name === name);
}

export function generateOpenAPISpecification(dataStructures, userInput) {

    console.log("dataStructures")
    console.log(dataStructures)
    console.log("userInput")

    const openAPISpec = {
        openapi: '3.0.0',
        info: {
            title: userInput.apiTitle,
            description: userInput.apiDescription,
            version: userInput.apiVersion,
        },
        servers: [
            {
                url: userInput.baseUrl,
            },
        ],
        paths: {},
        components: {
            schemas: {},
        },
    };

    function formatCompName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }

    /* Creates Schema Properties */
    function createProperties(fields) {
        //const properties = {};
        const properties: { [key: string]: any } = {};
        const required = []

        fields.forEach(field => {

            if (!field) return;

            let fieldClassType;

            /*
             * If field is an obj of type specified via classType - process nested fields recursively
             * else consider field as an obj of primitive type - default value string
             */

            if (field.classType) {
                const schemaName = formatCompName(field.classType);
                createComponentSchema(field.nestedFields);

                fieldClassType =
                {
                    $ref: `#/components/schemas/${schemaName}`,
                };

            }
            else {
                // fieldClassType =
                // {
                //     type: field.type || 'string',
                // };
                fieldClassType = convertToValidDataType(field.type || 'string');

            }

            /* Consider cardinality of the field */
            properties[field.name] = field.isArray ? { type: 'array', items: fieldClassType } : fieldClassType;

            /* If the user has specified field in the requestbody mark them as required */
            // if (requiredFields && requiredFields.includes(field.name)) {
            //     properties[field.name].required = true;
            // }

            if (field.isMandatory) {
                console.log(field)
                required.push(field.name);
            }

        });


        if (!properties.id) {
            properties.id = { type: 'integer' };
        }
        //return properties;
        return { properties, required };
    }

    /* Creates Component Schema Recursively */
    function createComponentSchema(dataStructure) {

        /* Check if DS exists */
        if (!dataStructure || !dataStructure.fields) return;

        const schemaName = formatCompName(dataStructure.name);

        /* Check if component schema exists*/
        if (openAPISpec.components.schemas[schemaName]) return;

        //const properties = createProperties(dataStructure.fields, dataStructure.requiredFields) as { id: { type: string } };

        const { properties, required } = createProperties(dataStructure.fields);

        /* Each component has to have id as their property */
        // if (!properties.id) {
        //     properties.id = {
        //         type: 'integer',
        //     };
        // }

        openAPISpec.components.schemas[schemaName] = {
            type: 'object',
            properties,
            required: required.length > 0 ? required : undefined,
        };

        // openAPISpec.components.schemas[schemaName] =
        // {
        //     type: 'object',
        //     properties,
        // };


        // TODO:  check if this works - adds comments
        if (Object.keys(properties).length === 1 && properties.id) {
            openAPISpec.components.schemas[schemaName] = {
                type: 'object',
                properties: {},
                description: 'TODO: Fill in the component properties',
            };
        } else {
            openAPISpec.components.schemas[schemaName] = {
                type: 'object',
                properties,
                required: required.length > 0 ? required : undefined
            };
        }
    }


    /* 
     * Construct Components
     * In case ds or its fields are undefined, skip
     * else create components shema 
     */
    dataStructures.forEach((ds) => {
        if (!ds || !ds.fields) return;
        createComponentSchema(ds);
    });

    // Constructing Paths and handling operations
    userInput.dataStructures.forEach((ds) => {
        ds.operations.forEach((operation) => {
            const path = operation.oEndpoint;
            const method = operation.oType.toLowerCase();

            /* Path obj initialization */
            if (!openAPISpec.paths[path]) {
                openAPISpec.paths[path] = {};
            }


            const parameters = [];
            const paramRegex = /{([^}]+)}/g;
            let match;

            /* 
             * Iterate over each match in the endpoint
             * Extract each match and creates a corresponding parameter obj
             */
            while ((match = paramRegex.exec(operation.oEndpoint)) !== null) {
                if (!hasDuplicate(parameters, match[1])) // TODO: test if this works
                {
                    parameters.push({
                        name: match[1],
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string',
                        },
                    });
                }

            }

            const operationObject: OperationObj =
            {
                summary: operation.oComment,
                operationId: operation.oName,
                parameters,
                responses: {
                    [operation.oResponse]: {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: `#/components/schemas/${formatCompName(ds.name)}`,
                                },
                            },
                        },
                    },
                },
            };

            if ((method === 'post' || method === 'put' || method === 'patch') && operation.oRequestBody) {
                const requestBodyProperties = {};

                /* 
                 * Extract field names - keys from operation.oRequestBody 
                 * such that corresponding values are true
                 */
                const requiredFields = Object.keys(operation.oRequestBody).filter(key => operation.oRequestBody[key]);

                for (const key of Object.keys(operation.oRequestBody)) {
                    const field = dataStructures.find((dataStruct) => dataStruct.name.toLowerCase() === ds.name.toLowerCase())?.fields.find((f) => f.name === key);

                    if (field) {
                        if (field.classType) {
                            requestBodyProperties[key] =
                            {
                                $ref: `#/components/schemas/${formatCompName(field.classType)}`,
                            };
                        }
                        else {
                            requestBodyProperties[key] = convertToValidDataType(field.type || 'string');

                            if (field.isArray) {
                                requestBodyProperties[key] = { type: 'array', items: requestBodyProperties[key] };
                            }

                        }
                    }
                }

                operationObject.requestBody =
                {
                    required: true,
                    content: {
                        'application/json':
                        {
                            schema:
                            {
                                type: 'object',
                                properties: requestBodyProperties,
                                required: requiredFields,
                            },
                        },
                    },
                };
            }

            if (operation.oResponseObject && operation.oResponseObject.givenName) {
                //console.log(operation)
                const givenName = formatCompName(operation.oResponseObject.givenName);
                const correspondingSchema = openAPISpec.components.schemas[givenName];
                if (correspondingSchema) {
                    operationObject.responses[operation.oResponse].content['application/json'].schema =
                    {
                        $ref: `#/components/schemas/${encodeURIComponent(givenName)}`,

                    };

                    //console.log(`#/components/schemas/${encodeURIComponent(givenName)}`)
                }
                else {
                    // Find class type based on given name within data structure fields
                    const dataStructure = dataStructures.find(ds => {
                        return ds.fields.some(field => formatCompName(field.name) === givenName && field.classType);
                    });
                    if (dataStructure) {
                        const field = dataStructure.fields.find(field => formatCompName(field.name) === givenName);
                        const classTypeRef = formatCompName(field.classType);
                        operationObject.responses[operation.oResponse].content['application/json'].schema =
                        {
                            $ref: `#/components/schemas/${classTypeRef}`,
                        };
                    } else {
                        console.warn(`No schema or class type found in components for givenName: ${givenName}`);
                    }
                }
            }


            openAPISpec.paths[path][method] = operationObject;
        });
    });

    return openAPISpec;
}
