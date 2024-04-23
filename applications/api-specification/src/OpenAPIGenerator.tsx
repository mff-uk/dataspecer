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


export function generateOpenAPISpecification(dataStructures, userInput) {
    // Initialization
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

    // Constructing Components - mapping fetched data structures
    dataStructures.forEach((ds) => {
        const properties = {};
        for (const [propName, propType] of Object.entries(ds.properties)) {
            properties[propName] = {
                type: (propType as string).toLowerCase(),
            };
        }

        openAPISpec.components.schemas[ds.name.toLowerCase()] = {
            type: 'object',
            properties,
        };
    });

    // Constructing Paths and handling operations
    userInput.dataStructures.forEach((ds) => {
        ds.operations.forEach((operation) => {
            const path = operation.oEndpoint;
            const method = operation.oType.toLowerCase();

            if (!openAPISpec.paths[path]) {
                openAPISpec.paths[path] = {};
            }

            // Extracting path parameters
            const parameters = [];
            const paramRegex = /{([^}]+)}/g;
            let match;
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

            // Construct operation object
            const operationObject = {
                summary: operation.oComment,
                operationId: operation.oName,
                parameters,
                requestBody: (operation.oType.toLowerCase() === 'post' || operation.oType.toLowerCase() === 'put') && operation.oRequestBody ? {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {},
                            },
                        },
                    },
                } : undefined,
                responses: {
                    [operation.oResponse]: {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: `#/components/schemas/${ds.name}`,
                                },
                            },
                        },
                    },
                },
            };

            // Handle request body if `oRequestBody` is provided
            if (operation.oRequestBody && (method === 'post' || method === 'put')) {
                const requestBodyProperties = {};
                for (const [key, value] of Object.entries(operation.oRequestBody)) {
                    requestBodyProperties[key] = {
                        type: 'string', // Assuming all request body properties are strings; adjust as needed
                    };
                }
            }

            // Handle response object if `oResponseObject` is provided
            if (operation.oResponseObject && operation.oResponseObject.givenName) {
                const givenName = operation.oResponseObject.givenName.toLowerCase();

                const correspondingSchema = openAPISpec.components.schemas[givenName];

                if (correspondingSchema) {
                    operationObject.responses[operation.oResponse].content['application/json'].schema = {
                        $ref: `#/components/schemas/${givenName}`,
                    };
                } else {
                    console.warn(`No schema found in components for givenName: ${givenName}`);
                }
            } 


            // Assign the operation object to the path and method
            openAPISpec.paths[path][method] = operationObject;
        });
    });

    return openAPISpec;
}
