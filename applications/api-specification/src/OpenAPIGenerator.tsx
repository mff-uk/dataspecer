// export function generateOpenAPISpecification(dataStructures, userInput) {
//     // Initialization
//     const openAPISpec = {
//         openapi: '3.0.0',
//         info: {
//             title: userInput.apiTitle,
//             description: userInput.apiDescription,
//             version: userInput.apiVersion,
//         },
//         servers: [
//             {
//                 url: userInput.baseUrl,
//             },
//         ],
//         paths: {},
//         components: {
//             schemas: {},
//         },
//     };

//     // Constructing Components - mapping fetched data structures
//     dataStructures.forEach((ds) => {
//         const properties = {};
//         for (const [propName, propType] of Object.entries(ds.properties)) {
//             properties[propName] = {
//                 type: (propType as string).toLowerCase(), 
//             };
//         }

//         openAPISpec.components.schemas[ds.givenName.toLowerCase()] = {
//             type: 'object',
//             properties,
//         };
//     });

//     userInput.dataStructures.forEach((ds) => {
//         const operations = ds.singleResOperation || [];
//         operations.forEach((operation) => {
//             const path = operation.oEndpoint.replace(userInput.baseUrl, '');
//             const method = operation.oType.toLowerCase();

//             if (!openAPISpec.paths[path]) {
//                 openAPISpec.paths[path] = {};
//             }

//             const parameters = [];

//             const paramRegex = /{([^}]+)}/g;
//             let match;

//             while ((match = paramRegex.exec(operation.oEndpoint)) !== null) {
//                 parameters.push({
//                     name: match[1],
//                     in: 'path',
//                     required: true,
//                     schema: {
//                         type: 'string',
//                     },
//                 });
//             }

//             openAPISpec.paths[path][method] = {
//                 summary: operation.oComment,
//                 operationId: operation.oName,
//                 parameters,
//                 responses: {
//                     [operation.oResponse]: {
//                         description: 'Successful operation',
//                         content: {
//                             'application/json': {
//                                 schema: {
//                                     $ref: `#/components/schemas/${ds.name}`,
//                                 },
//                             },
//                         },
//                     },
//                 },
//             };

//             if (method === 'post' || method === 'put') {
//                 openAPISpec.paths[path][method].requestBody = {
//                     required: true,
//                     content: {
//                         'application/json': {
//                             schema: {
//                                 $ref: `#/components/schemas/${ds.name}`,
//                             },
//                         },
//                     },
//                 };
//             }
//         });
//     });

//     return openAPISpec;
// }


// export function generateOpenAPISpecification(dataStructures, userInput) {
//     // Initialization
//     const openAPISpec = {
//         openapi: '3.0.0',
//         info: {
//             title: userInput.apiTitle,
//             description: userInput.apiDescription,
//             version: userInput.apiVersion,
//         },
//         servers: [
//             {
//                 url: userInput.baseUrl,
//             },
//         ],
//         paths: {},
//         components: {
//             schemas: {},
//         },
//     };

//     // Constructing Components - mapping fetched data structures
//     dataStructures.forEach((ds) => {
//         const properties = {};
//         for (const [propName, propType] of Object.entries(ds.properties)) {
//             properties[propName] = {
//                 type: (propType as string).toLowerCase(),
//             };
//         }

//         openAPISpec.components.schemas[ds.name.toLowerCase()] = {
//             type: 'object',
//             properties,
//         };
//     });

//     // Constructing Paths and handling operations
//     userInput.dataStructures.forEach((ds) => {
//         ds.operations.forEach((operation) => {
//             const path = operation.oEndpoint;
//             const method = operation.oType.toLowerCase();

//             if (!openAPISpec.paths[path]) {
//                 openAPISpec.paths[path] = {};
//             }

//             // Extracting path parameters
//             const parameters = [];
//             const paramRegex = /{([^}]+)}/g;
//             let match;
//             while ((match = paramRegex.exec(operation.oEndpoint)) !== null) {
//                 parameters.push({
//                     name: match[1],
//                     in: 'path',
//                     required: true,
//                     schema: {
//                         type: 'string',
//                     },
//                 });
//             }

//             // Construct operation object
//             const operationObject = {
//                 summary: operation.oComment,
//                 operationId: operation.oName,
//                 parameters,
//                 requestBody: (operation.oType.toLowerCase() === 'post' || operation.oType.toLowerCase() === 'put') && operation.oRequestBody ? {
//                     required: true,
//                     content: {
//                         'application/json': {
//                             schema: {
//                                 type: 'object',
//                                 properties: {},
//                             },
//                         },
//                     },
//                 } : undefined,
//                 responses: {
//                     [operation.oResponse]: {
//                         description: 'Successful operation',
//                         content: {
//                             'application/json': {
//                                 schema: {
//                                     $ref: `#/components/schemas/${ds.name}`,
//                                 },
//                             },
//                         },
//                     },
//                 },
//             };

//             // Handle request body if `oRequestBody` is provided
//             if (operation.oRequestBody && (method === 'post' || method === 'put')) {
//                 const requestBodyProperties = {};
//                 for (const [key, value] of Object.entries(operation.oRequestBody)) {
//                     requestBodyProperties[key] = {
//                         type: 'string', // Assuming all request body properties are strings; adjust as needed
//                     };
//                 }
//             }

//             // Handle response object if `oResponseObject` is provided
//             if (operation.oResponseObject && operation.oResponseObject.givenName) {
//                 const givenName = operation.oResponseObject.givenName.toLowerCase();

//                 const correspondingSchema = openAPISpec.components.schemas[givenName];

//                 if (correspondingSchema) {
//                     operationObject.responses[operation.oResponse].content['application/json'].schema = {
//                         $ref: `#/components/schemas/${givenName}`,
//                     };
//                 } else {
//                     console.warn(`No schema found in components for givenName: ${givenName}`);
//                 }
//             } 


//             // Assign the operation object to the path and method
//             openAPISpec.paths[path][method] = operationObject;
//         });
//     });

//     return openAPISpec;
// }

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

            //     // Constructing operation object
            //     const operationObject = {
            //         summary: operation.oComment,
            //         operationId: operation.oName,
            //         parameters,
            //         requestBody: (method === 'post' || method === 'put' || method === 'patch') && operation.oRequestBody ? {
            //             required: true,
            //             content: {
            //                 'application/json': {
            //                     schema: {
            //                         type: 'object',
            //                         properties: {},
            //                     },
            //                 },
            //             },
            //         } : undefined,
            //         responses: {
            //             [operation.oResponse]: {
            //                 description: 'Successful operation',
            //                 content: {
            //                     'application/json': {
            //                         schema: {
            //                             $ref: `#/components/schemas/${ds.name.toLowerCase()}`,
            //                         },
            //                     },
            //                 },
            //             },
            //         },
            //     };

            //     // Handle request body if `oRequestBody` is provided
            //     if (operation.oRequestBody && (method === 'post' || method === 'put')) {
            //         const requestBodyProperties = {};
            //         for (const key of Object.keys(operation.oRequestBody)) {
            //             // Find the corresponding field in data structures
            //             const field = dataStructures.find(
            //                 (dataStruct) => dataStruct.name.toLowerCase() === ds.name.toLowerCase()
            //             )?.fields.find((f) => f.name === key);

            //             if (field) {
            //                 if (field.classType) {
            //                     // Field references another data structure
            //                     requestBodyProperties[key] = {
            //                         $ref: `#/components/schemas/${field.classType.toLowerCase()}`,
            //                     };
            //                 } else {
            //                     // Field is a primitive type
            //                     requestBodyProperties[key] = {
            //                         type: field.type || 'string',
            //                         isArray: field.isArray,
            //                     };
            //                 }
            //             }
            //         }
            //         operationObject.requestBody.content['application/json'].schema.properties = requestBodyProperties;
            //     }

            //     // Handle response object if `oResponseObject` is provided
            //     if (operation.oResponseObject && operation.oResponseObject.givenName) {
            //         const givenName = operation.oResponseObject.givenName.toLowerCase();
            //         const correspondingSchema = openAPISpec.components.schemas[givenName];

            //         if (correspondingSchema) {
            //             operationObject.responses[operation.oResponse].content['application/json'].schema = {
            //                 $ref: `#/components/schemas/${givenName}`,
            //             };
            //         } else {
            //             console.warn(`No schema found in components for givenName: ${givenName}`);
            //         }
            //     }

            //     // Assign the operation object to the path and method
            //     openAPISpec.paths[path][method] = operationObject;

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
