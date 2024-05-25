import { convertToOpenAPIDataType } from './DataTypeConverter.tsx';
import { OApiOperationObj } from './Models/OApiOperationObjModel.tsx';

const SCHEMA_REF_PREFIX = '#/components/schemas/';

/* 
 * generates OpenAPI specification based on following parameters:
 * dataStructures - information fetched from DataSpecer backend
 * userInput - info provided by the user via UI
 */
export function generateOpenAPISpecification(dataStructures, userInput) {
    const openAPISpec = initializeOpenAPISpec(userInput);

    dataStructures.forEach(ds => {
        if (!ds || !ds.fields) return;
        createComponentSchema(openAPISpec, ds);
    });

    userInput.dataStructures.forEach(ds => {
        ds.operations.forEach(operation => {
            handlePathOperations(openAPISpec, dataStructures, ds, operation);
        });
    });

    return openAPISpec;
}


/* Initializes OpenAPI specification based on the information the user has provided */
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

/* 
 * formats name to a format that is accepted by OpenAPI
 * all characters that are not numbers, underscore or letters are replaced by underscore 
 */
function formatName(name) {
    return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

/* checks for duplicate parameters */
function hasDuplicate(parameters, name) {
    return parameters.some(param => param.name === name);
}

/* creates properties based on the fields (attributes and associations of ds) */
function createProperties(openAPISpec, fields) {
    
    console.log("CREATE PROPERTIES")
    console.log(fields)
    const properties: { [key: string]: any } = {};
    const required = [];

    fields.forEach(field => {
        if (!field) return;

        let fieldClassType;

        /* If the type of the field is not a primitive data type
         * the type of the field is stored in classType*/
        
        /* If not primivitve data type - create reference schema and a reference to the schema*/
        if (field.classType) 
        {
            const schemaName = formatName(field.classType);
            createComponentSchema(openAPISpec, field.nestedFields);
            fieldClassType = { $ref: `${SCHEMA_REF_PREFIX}${schemaName}` };
        } 
        else 
        {
            fieldClassType = convertToOpenAPIDataType(field.type || 'string');
        }

        /* determine whether field represents an array and set properties accordingly */
        properties[field.name] = field.isArray ? { type: 'array', items: fieldClassType } : fieldClassType;

        /* if the field needs to be marked as required - add to the required section */
        if (field.isMandatory) {
            required.push(field.name);
        }
    });

    /* Append id of type integer as identifier if not present */
    if (!properties.id) {
        properties.id = { type: 'integer' };
    }

    return { properties, required };
}

/* creates component schema */ 
function createComponentSchema(openAPISpec, dataStructure) {

    /* Check if DS exists */
    if (!dataStructure || !dataStructure.fields) return;

    /* format name */  
    const schemaName = formatName(dataStructure.name);

    /* Check if component schema exists*/
    if (openAPISpec.components.schemas[schemaName]) return;

    /* get properties (including required properties) */
    const { properties, required } = createProperties(openAPISpec, dataStructure.fields);

    /* 
     * create schema obj 
     * if no properties were retrieved 
     * append in the description that this component needs to be filled in the future 
     */
    openAPISpec.components.schemas[schemaName] = {
        type: 'object',
        properties: Object.keys(properties).length === 1 && properties.id ? {} : properties,
        required: required.length > 0 ? required : undefined,
        description: Object.keys(properties).length === 1 && properties.id ? 'TODO: Fill in the component' : undefined,
    };
}

/* handles operations of path (endpoint) */ 
function handlePathOperations(openAPISpec, dataStructures, ds, operation) {
    /* get path (endpoint) and operationtype (e.g get, post ...) */
    const path = operation.oEndpoint;
    const operationType = operation.oType.toLowerCase();

    // Check if path obj exists, if not initialize 
    if (!openAPISpec.paths[path]) {
        openAPISpec.paths[path] = {};
    }

    const parameters = extractPathParameters(operation.oEndpoint);
    const operationObject = createOperationObject(openAPISpec, dataStructures, ds, operation, parameters);

    // if GET - generate query parameters
    if (operationType === 'get') {
        addQueryParameters(openAPISpec, ds, operation, parameters);
    }

    openAPISpec.paths[path][operationType] = operationObject;
}

/* extracts path params from path (endpoint) */
function extractPathParameters(endpoint) {
    const parameters = [];
    const paramRegex = /{([^}]+)}/g;
    let match;


    /* 
     * Iterate over each match in the path (endpoint) and check if there is a duplicate 
     * if parameter does not already exist 
     * add it to parameters arr 
     */
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

/* creates operation object */
function createOperationObject(openAPISpec, dataStructures, ds, operation, parameters) {
    
    // populate OperationObject with info provided from user 
    const operationObject: OApiOperationObj = {
        summary: operation.oComment,
        operationId: operation.oName,
        parameters,
        responses: createResponses(openAPISpec, dataStructures, ds, operation),
    };

    /* 
     * if operationtype is POST or PATCH and there is a request body defined
     * create request body object via function - createRequestBody
     */
    if (['post', 'patch'].includes(operation.oType.toLowerCase()) && operation.oRequestBody) {
        operationObject.requestBody = createRequestBody(dataStructures, ds, operation);
    }

    /* If operationtype is PUT 
     * create requestbody consisting of all fields/properties included in schema reference 
     */
    if (operation.oType.toLowerCase() === 'put') {
        operationObject.requestBody = {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        //$ref: `#/components/schemas/${formatName(ds.name)}`,
                        $ref: `${SCHEMA_REF_PREFIX}${formatName(ds.name)}`,
                    },
                },
            },
        };
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
                        //$ref: `#/components/schemas/${formatName(ds.name)}`,
                        $ref: `${SCHEMA_REF_PREFIX}${formatName(ds.name)}`,
                    },
                },
            },
        },
    };

    if (operation.oResponseObject && operation.oResponseObject.givenName) {
        const givenName = formatName(operation.oResponseObject.givenName);
        const correspondingSchema = openAPISpec.components.schemas[givenName];

        if (correspondingSchema) {
            responses[operation.oResponse].content['application/json'].schema = {
                //$ref: `#/components/schemas/${encodeURIComponent(givenName)}`,
                $ref: `${SCHEMA_REF_PREFIX}${encodeURIComponent(givenName)}`,
            };
        } else {
            updateSchemaFromField(dataStructures, ds, givenName, responses, operation);
        }
    }

    return responses;
}

function updateSchemaFromField(dataStructures, ds, givenName, responses, operation) {
    const dataStructure = dataStructures.find(ds => {
        return ds.fields.some(field => formatName(field.name) === givenName && field.classType);
    });

    if (dataStructure) {
        const field = dataStructure.fields.find(field => formatName(field.name) === givenName);
        const classTypeRef = formatName(field.classType);
        responses[operation.oResponse].content['application/json'].schema = {
            //$ref: `#/components/schemas/${classTypeRef}`,
            $ref: `${SCHEMA_REF_PREFIX}${classTypeRef}`,
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
                    //$ref: `#/components/schemas/${formatName(field.classType)}`,
                    $ref: `${SCHEMA_REF_PREFIX}${formatName(field.classType)}`,
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
        ? formatName(operation.oResponseObject.givenName)
        : formatName(ds.name);
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
