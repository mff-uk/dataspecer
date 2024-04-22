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

        openAPISpec.components.schemas[ds.givenName.toLowerCase()] = {
            type: 'object',
            properties,
        };
    });

    userInput.dataStructures.forEach((ds) => {
        const operations = ds.singleResOperation || [];
        operations.forEach((operation) => {
            const path = operation.oEndpoint.replace(userInput.baseUrl, '');
            const method = operation.oType.toLowerCase();

            if (!openAPISpec.paths[path]) {
                openAPISpec.paths[path] = {};
            }

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

            openAPISpec.paths[path][method] = {
                summary: operation.oComment,
                operationId: operation.oName,
                parameters,
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

            if (method === 'post' || method === 'put') {
                openAPISpec.paths[path][method].requestBody = {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: `#/components/schemas/${ds.name}`,
                            },
                        },
                    },
                };
            }
        });
    });

    return openAPISpec;
}
