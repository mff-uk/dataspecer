interface OperationObj {
    summary: any;
    operationId: any;
    parameters: any[];
    requestBody?: any; 
    responses: { [x: number]: 
        { 
            description: string;
            content: 
            { 'application/json': 
                { schema: { $ref: string; }; 
                }; 
            }; 
        }; 
    };
}

export function generateOpenAPISpecification(dataStructures, userInput) {

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

    function formatCompName(name) 
    {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    }

    /* Creates Schema Properties */
    function createProperties(fields, requiredFields) {
        const properties = {};

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

            } else {
                fieldClassType =
                {
                    type: field.type || 'string',
                };
            }

            /* Consider cardinality of the field */
            properties[field.name] = field.isArray ? { type: 'array', items: fieldClassType } : fieldClassType;

            /* If the user has specified field in the requestbody mark them as required */
            if (requiredFields && requiredFields.includes(field.name)) {
                properties[field.name].required = true;
            }

        });

        return properties;
    }

    /* Creates Component Schema Recursively */
    function createComponentSchema(dataStructure) {

        /* Check if DS exists */
        if (!dataStructure || !dataStructure.fields) return;

        const schemaName = formatCompName(dataStructure.name);

        /* Check if component schema exists*/
        if (openAPISpec.components.schemas[schemaName]) return;

        const properties = createProperties(dataStructure.fields, dataStructure.requiredFields) as { id: { type: string } };

        /* Each component has to have id as their property */
        if (!properties.id) {
            properties.id = {
                type: 'integer',
            };
        }

        openAPISpec.components.schemas[schemaName] =
        {
            type: 'object',
            properties,
        };
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
                parameters.push({
                    name: match[1],
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                });
            }

            const operationObject : OperationObj =
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
                
                for (const key of Object.keys(operation.oRequestBody)) 
                {
                    const field = dataStructures.find((dataStruct) => dataStruct.name.toLowerCase() === ds.name.toLowerCase())?.fields.find((f) => f.name === key);

                    if (field) 
                    {
                        if (field.classType) 
                        {
                            requestBodyProperties[key] = 
                            {
                                $ref: `#/components/schemas/${formatCompName(field.classType)}`,
                            };
                        } 
                        else 
                        {
                            requestBodyProperties[key] = 
                            {
                                type: field.type || 'string',
                                isArray: field.isArray,
                            };
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

            if (operation.oResponseObject && operation.oResponseObject.givenName) 
            {
                const givenName = formatCompName(operation.oResponseObject.givenName);
                const correspondingSchema = openAPISpec.components.schemas[givenName];

                if (correspondingSchema)
                {
                    operationObject.responses[operation.oResponse].content['application/json'].schema = 
                    {
                        $ref: `#/components/schemas/${encodeURIComponent(givenName)}`,
                    };
                } 
                else 
                {
                    console.warn(`No schema found in components for givenName: ${givenName}`);
                }
            }

            openAPISpec.paths[path][method] = operationObject;
        });
    });

    return openAPISpec;
}
