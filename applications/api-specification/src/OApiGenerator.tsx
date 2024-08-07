import { convertToOpenAPIDataType } from './DataTypeConverter.tsx';
import { OApiOperationObj } from './Models/OApiOperationObjModel.tsx';
import { StatusCode } from './Models/StatusCodeModel.tsx';
import { httpStatusCodes } from './customComponents/StatusCodeSelect.tsx';

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
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
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

    const properties: { [key: string]: any } = {};
    const required = [];

    fields.forEach(field => {
        if (!field) return;

        let fieldClassType;

        /* If the type of the field is not a primitive data type
         * the type of the field is stored in classType*/

        /* If not primivitve type - create reference schema and a reference to the schema*/
        if (field.classType) {
            const schemaName = formatName(field.classType);
            createComponentSchema(openAPISpec, field.nestedFields);
            fieldClassType = { $ref: `${SCHEMA_REF_PREFIX}${schemaName}` };
        }
        else {
            fieldClassType = convertToOpenAPIDataType(field.type || 'string');
        }

        /* determine whether field represents an array and set properties accordingly */
        properties[field.name] = field.isArray ? { type: 'array', items: fieldClassType } : fieldClassType;

        /* if the field needs to be marked as required - add to the required section */
        if (field.isMandatory) {
            required.push(field.name);
        }
    });

    /* Append id of type string as identifier if not present */
    if (!properties.id) {
        properties.id = { type: 'string' };
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
    const endPoint = operation.oEndpoint.startsWith('/') ? operation.oEndpoint : '/' + operation.oEndpoint;
    //const path = operation.oEndpoint;
    const path = endPoint;
    const operationType = operation.oType.toLowerCase();

    // Check if path obj exists, if not initialize 
    if (!openAPISpec.paths[path]) {
        openAPISpec.paths[path] = {};
    }

    const parameters = extractPathParameters(operation.oEndpoint);
    const operationObject = createOperationObject(openAPISpec, dataStructures, ds, operation, parameters);

    // if GET - generate query parameters
    if (operationType === 'get') {
        generateQueryParams(openAPISpec, ds, operation, parameters);
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
        operationId: formatName(operation.oName),
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
        let schemaName = ds.name;
        if (operation.oResponseObject && operation.oResponseObject.givenName) {
            schemaName = operation.oResponseObject.givenName;
        }
        operationObject.requestBody = {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: `${SCHEMA_REF_PREFIX}${formatName(schemaName)}`,
                    },
                },
            },
        };
    }

    return operationObject;
}

/* creates responses section */
function createResponses(openAPISpec, dataStructures, ds, operation) {

    const responses = {
        [operation.oResponse]: {
            description: ' ',
            content: {
                'application/json': {
                    schema: {
                        //$ref: `${SCHEMA_REF_PREFIX}${formatName(ds.name)}`,
                    },
                },
            },
        },
    };

    httpStatusCodes.forEach((status: StatusCode) => {
        if (status.value === operation.oResponse) {
            responses[operation.oResponse].description = status.label;
        }
    });

    if (operation.oResponse === "200" || operation.oResponse === "201") {
        responses[operation.oResponse].content['application/json'].schema = {
            $ref: `${SCHEMA_REF_PREFIX}${formatName(ds.name)}`,
        };
    }

    // If response obj was provided by the user (target data structure on the form )
    if (operation.oResponseObject && operation.oResponseObject.givenName && (operation.oResponse === "200" || operation.oResponse === "201")) {
        // get name and correspondingschema of this ds
        const givenName = formatName(operation.oResponseObject.givenName);
        const correspondingSchema = openAPISpec.components.schemas[givenName];

        /*
         * if corresponding schema exists - add reference to it 
         * else - update schema
         */
        if (correspondingSchema) {
            console.log("This is corresponding schema")
            console.log(correspondingSchema)
            responses[operation.oResponse].content['application/json'].schema = {
                $ref: `${SCHEMA_REF_PREFIX}${encodeURIComponent(givenName)}`,
            };
        }
        else {
            updateResponseObjSchema(dataStructures, ds, givenName, responses, operation);
        }
    }

    if (operation.isCollection && operation.oType === "GET" && operation.oResponse === "200") {
        responses[operation.oResponse].content['application/json'].schema = {
            type: 'array',
            items: responses[operation.oResponse].content['application/json'].schema,
        };
    }

    return responses;
}

/* updates schema within response object */
function updateResponseObjSchema(dataStructures, ds, givenName, responses, operation) {

    // find datastructure based on the fields givenname such that has classType
    const dataStructure = dataStructures.find(ds => {
        return ds.fields.some(field => formatName(field.name) === givenName && field.classType);
    });

    /* 
     * If such datastruture is found 
     * update schema within the response obj
     */
    if (dataStructure) {
        const field = dataStructure.fields.find(field => formatName(field.name) === givenName);
        const classTypeRef = formatName(field.classType);
        responses[operation.oResponse].content['application/json'].schema =
        {
            $ref: `${SCHEMA_REF_PREFIX}${classTypeRef}`,
        };
    }
    else {
        console.warn(`No schema or class type found in components for givenName: ${givenName}`);
    }
}

/* creates request body for an operation*/
function createRequestBody(dataStructures, ds, operation) {

    const requestBodyProperties = {};

    function findFieldInNestedFields(nestedFields, myKey) {

        for (const field of nestedFields) {
            if (field.name === myKey) {
                return field;
            }
            if (field.nestedFields) {
                const nestedField = findFieldInNestedFields(field.nestedFields.fields, myKey);
                if (nestedField) {
                    return nestedField;
                }
            }
        }
        return null;
    }

    // Iterate over each key in the request body
    for (const key of Object.keys(operation.oRequestBody)) {
        if (operation.oRequestBody[key] === true) {
            /* Try to find field on the base case */
            const dataStruct = dataStructures.find(dataStruct => {
                return dataStruct.givenName.toLowerCase() === ds.name.toLowerCase();
            });

            let field = dataStruct?.fields.find(f => f.name === key);

            /* If field was ont found on the base case - look in the nested fields */
            if (!field && dataStruct) {
                field = findFieldInNestedFields(dataStruct.fields, key);
            }

            /*
             * If field is not a primitive data type - set schema reference
             * else - set data type 
             */
            if (field) {
                if (field.classType) {

                    requestBodyProperties[key] = {
                        $ref: `${SCHEMA_REF_PREFIX}${formatName(field.classType)}`,
                    }
                }
                else {
                    requestBodyProperties[key] = convertToOpenAPIDataType(field.type || 'string');

                    // If field represents an array - update accordingly
                    if (field.isArray) {
                        requestBodyProperties[key] = { type: 'array', items: requestBodyProperties[key] };
                    }
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
                },
            },
        },
    };
}


/* 
 * generates query parameters - is called in case operationtype is GET 
 * the function determines properties of the datastructure and generates corresponding query parameters
 */
function generateQueryParams(openAPISpec, ds, operation, parameters) {

    // get schemaname 
    // const schemaName = operation.oResponseObject && operation.oResponseObject.givenName
    //     ? formatName(operation.oResponseObject.givenName)
    //     : formatName(ds.name);

    let schemaName = '';

    // find corresponding schema
    if (operation.oResponseObject && operation.oResponseObject.givenName) {
        const givenName = formatName(operation.oResponseObject.givenName);

        for (const [key, value] of Object.entries(openAPISpec.components.schemas)) {
            if (typeof value === 'object' && 'properties' in value) {
                const properties = (value as { properties: Record<string, any> }).properties;
                if (properties[givenName]) {
                    schemaName = properties[givenName].$ref || properties[givenName].items.$ref;
                    schemaName = schemaName.split('/').pop();
                    break;
                }
            }
        }
    }
    else {
        schemaName = formatName(ds.name);
    }

    // get correspondingschema 
    const schema = openAPISpec.components.schemas[schemaName];

    // iterate over properties and generate corresponding query parameters
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
