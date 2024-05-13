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

export function generateOpenAPISpecification(dataStructures, userInput) {
    // Initialization of OpenAPI Specification
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

    // Helper function to create properties for schemas from fields
    function createProperties(fields) {
        const properties = {};
        fields.forEach(field => {
            if (!field) return; // Skip if the field is undefined

            let fieldType;
            if (field.classType) {
                // If field is an Object type with classType, recursively process the nested fields
                const schemaName = field.classType.toLowerCase();
                createComponentSchema(field.nestedFields);

                // Create a reference to the schema for the nested object
                fieldType = {
                    $ref: `#/components/schemas/${schemaName}`,
                };
            } else {
                // Field is a primitive type
                fieldType = {
                    type: field.type || 'string', // Default to 'string' if type is undefined
                };
            }

            properties[field.name] = field.isArray
                ? { type: 'array', items: fieldType }
                : fieldType;
        });
        return properties;
    }

    // Recursive helper function to create a component schema for nested fields
    function createComponentSchema(dataStructure) {
        if (!dataStructure || !dataStructure.fields) return;

        const schemaName = dataStructure.name.toLowerCase();
        if (openAPISpec.components.schemas[schemaName]) {
            // Schema already exists, skip
            return;
        }

        const properties = createProperties(dataStructure.fields);
        openAPISpec.components.schemas[schemaName] = {
            type: 'object',
            properties,
        };
    }

    // Constructing Components - mapping data structures
    dataStructures.forEach((ds) => {
        if (!ds || !ds.fields) return; // Skip if ds or ds.fields is undefined

        // Create a component schema for the data structure
        createComponentSchema(ds);
    });

    // Constructing Paths and handling operations
    userInput.dataStructures.forEach((ds) => {
        ds.operations.forEach((operation) => {
            const path = operation.oEndpoint;
            const method = operation.oType.toLowerCase();

            // Initialize the path object if not already present
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

            // Constructing operation object
            const operationObject = {
                summary: operation.oComment,
                operationId: operation.oName,
                parameters,
                requestBody: (method === 'post' || method === 'put') && operation.oRequestBody ? {
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
                                    $ref: `#/components/schemas/${ds.name.toLowerCase()}`,
                                },
                            },
                        },
                    },
                },
            };

            // Handle request body if `oRequestBody` is provided
            if (operation.oRequestBody && (method === 'post' || method === 'put')) {
                const requestBodyProperties = {};
                for (const key of Object.keys(operation.oRequestBody)) {
                    // Find the corresponding field in data structures
                    const field = dataStructures.find(
                        (dataStruct) => dataStruct.name.toLowerCase() === ds.name.toLowerCase()
                    )?.fields.find((f) => f.name === key);

                    if (field) {
                        if (field.classType) {
                            // Field references another data structure
                            requestBodyProperties[key] = {
                                $ref: `#/components/schemas/${field.classType.toLowerCase()}`,
                            };
                        } else {
                            // Field is a primitive type
                            requestBodyProperties[key] = {
                                type: field.type || 'string',
                                isArray: field.isArray,
                            };
                        }
                    }
                }
                operationObject.requestBody.content['application/json'].schema.properties = requestBodyProperties;
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
