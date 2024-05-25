import { convertToOpenAPIDataType } from './DataTypeConverter.tsx';
import { OApiOperationObj } from './Models/OApiOperationObjModel.tsx';


export function generateOpenAPISpecification(dataStructures, userInput) {
    const openAPISpec = initializeOpenAPISpec(userInput);

    dataStructures.forEach(ds => {
        if (!ds || !ds.fields) return;
        createComponentSchema(openAPISpec, ds);
    });

    userInput.dataStructures.forEach(ds => {
        ds.operations.forEach(operation => {
            addOperationToPaths(openAPISpec, dataStructures, ds, operation);
        });
    });

    return openAPISpec;
}

function initializeOpenAPISpec(userInput) {
    return {
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
}

function formatCompName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

function hasDuplicate(parameters, name) {
    return parameters.some(param => param.name === name);
}

function createProperties(openAPISpec, fields) {
    const properties: { [key: string]: any } = {};
    const required = [];

    fields.forEach(field => {
        if (!field) return;

        let fieldClassType;
        if (field.classType) 
        {
            const schemaName = formatCompName(field.classType);
            createComponentSchema(openAPISpec, field.nestedFields);
            fieldClassType = { $ref: `#/components/schemas/${schemaName}` };
        } 
        else 
        {
            fieldClassType = convertToOpenAPIDataType(field.type || 'string');
        }

        properties[field.name] = field.isArray ? { type: 'array', items: fieldClassType } : fieldClassType;

        if (field.isMandatory) {
            required.push(field.name);
        }
    });

    if (!properties.id) {
        properties.id = { type: 'integer' };
    }

    return { properties, required };
}

function createComponentSchema(openAPISpec, dataStructure) {
    if (!dataStructure || !dataStructure.fields) return;

    const schemaName = formatCompName(dataStructure.name);
    if (openAPISpec.components.schemas[schemaName]) return;

    const { properties, required } = createProperties(openAPISpec, dataStructure.fields);

    openAPISpec.components.schemas[schemaName] = {
        type: 'object',
        properties: Object.keys(properties).length === 1 && properties.id ? {} : properties,
        required: required.length > 0 ? required : undefined,
        description: Object.keys(properties).length === 1 && properties.id ? 'TODO: Fill in the component properties' : undefined,
    };
}

function addOperationToPaths(openAPISpec, dataStructures, ds, operation) {
    const path = operation.oEndpoint;
    const method = operation.oType.toLowerCase();

    if (!openAPISpec.paths[path]) {
        openAPISpec.paths[path] = {};
    }

    const parameters = extractPathParameters(operation.oEndpoint);
    const operationObject = createOperationObject(openAPISpec, dataStructures, ds, operation, parameters);

    if (method === 'get') {
        addQueryParameters(openAPISpec, ds, operation, parameters);
    }

    openAPISpec.paths[path][method] = operationObject;
}

function extractPathParameters(endpoint) {
    const parameters = [];
    const paramRegex = /{([^}]+)}/g;
    let match;

    while ((match = paramRegex.exec(endpoint)) !== null) {
        if (!hasDuplicate(parameters, match[1])) {
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

    return parameters;
}

function createOperationObject(openAPISpec, dataStructures, ds, operation, parameters) {
    const operationObject: OApiOperationObj = {
        summary: operation.oComment,
        operationId: operation.oName,
        parameters,
        responses: createResponses(openAPISpec, dataStructures, ds, operation),
    };

    if (['post', 'put', 'patch'].includes(operation.oType.toLowerCase()) && operation.oRequestBody) {
        operationObject.requestBody = createRequestBody(dataStructures, ds, operation);
    }

    return operationObject;
}

function createResponses(openAPISpec, dataStructures, ds, operation) {
    const responses = {
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
    };

    if (operation.oResponseObject && operation.oResponseObject.givenName) {
        const givenName = formatCompName(operation.oResponseObject.givenName);
        const correspondingSchema = openAPISpec.components.schemas[givenName];

        if (correspondingSchema) {
            responses[operation.oResponse].content['application/json'].schema = {
                $ref: `#/components/schemas/${encodeURIComponent(givenName)}`,
            };
        } else {
            updateSchemaFromField(dataStructures, ds, givenName, responses, operation);
        }
    }

    return responses;
}

function updateSchemaFromField(dataStructures, ds, givenName, responses, operation) {
    const dataStructure = dataStructures.find(ds => {
        return ds.fields.some(field => formatCompName(field.name) === givenName && field.classType);
    });

    if (dataStructure) {
        const field = dataStructure.fields.find(field => formatCompName(field.name) === givenName);
        const classTypeRef = formatCompName(field.classType);
        responses[operation.oResponse].content['application/json'].schema = {
            $ref: `#/components/schemas/${classTypeRef}`,
        };
    } else {
        console.warn(`No schema or class type found in components for givenName: ${givenName}`);
    }
}

function createRequestBody(dataStructures, ds, operation) {
    const requestBodyProperties = {};
    const requiredFields = Object.keys(operation.oRequestBody).filter(key => operation.oRequestBody[key]);

    for (const key of Object.keys(operation.oRequestBody)) {
        const field = dataStructures
            .find(dataStruct => dataStruct.name.toLowerCase() === ds.name.toLowerCase())
            ?.fields.find(f => f.name === key);

        if (field) {
            if (field.classType) {
                requestBodyProperties[key] = {
                    $ref: `#/components/schemas/${formatCompName(field.classType)}`,
                };
            } else {
                requestBodyProperties[key] = convertToOpenAPIDataType(field.type || 'string');
                if (field.isArray) {
                    requestBodyProperties[key] = { type: 'array', items: requestBodyProperties[key] };
                }
            }
        }
    }

    return {
        required: true,
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: requestBodyProperties,
                    required: requiredFields,
                },
            },
        },
    };
}

function addQueryParameters(openAPISpec, ds, operation, parameters) {
    const schemaName = operation.oResponseObject && operation.oResponseObject.givenName
        ? formatCompName(operation.oResponseObject.givenName)
        : formatCompName(ds.name);
    const schema = openAPISpec.components.schemas[schemaName];

    if (schema && schema.properties) {
        Object.keys(schema.properties).forEach(fieldName => {
            if (!operation.oEndpoint.includes(`{${fieldName}}`)) {
                parameters.push({
                    name: fieldName,
                    in: 'query',
                    description: `Filter results based on ${fieldName}`,
                    schema: schema.properties[fieldName],
                });
            }
        });
    }
}
