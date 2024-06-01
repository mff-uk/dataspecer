// interface OpenAPIObject {
//     openapi: string;
//     info: InfoObject;
//     servers?: ServerObject[];
//     paths: PathsObject;
//     components?: ComponentsObject;
//     security?: SecurityRequirementObject[];
//     tags?: TagObject[];
//     externalDocs?: ExternalDocumentationObject;
//   }
  
//   interface InfoObject {
//     title: string;
//     version: string;
//     description?: string;
//     termsOfService?: string;
//     contact?: ContactObject;
//     license?: LicenseObject;
//   }
  
//   interface ContactObject {
//     name?: string;
//     url?: string;
//     email?: string;
//   }
  
//   interface LicenseObject {
//     name: string;
//     url?: string;
//   }
  
//   interface ServerObject {
//     url: string;
//     description?: string;
//     variables?: { [variable: string]: ServerVariableObject };
//   }
  
//   interface ServerVariableObject {
//     enum?: string[];
//     default: string;
//     description?: string;
//   }
  
//   interface PathsObject {
//     [path: string]: PathItemObject | any;
//   }
  
//   type PathItemObject = {
//     $ref?: string;
//   } & ({
//     $ref?: never;
//   } & {
//     [method: string]: OperationObject;
//   });
  
//   interface OperationObject {
//     responses: ResponsesObject;
//     summary?: string;
//     description?: string;
//     operationId?: string;
//     parameters?: (ParameterObject | ReferenceObject)[];
//     requestBody?: RequestBodyObject | ReferenceObject;
//     deprecated?: boolean;
//     security?: SecurityRequirementObject[];
//     tags?: string[];
//     externalDocs?: ExternalDocumentationObject;
//   }
  
//   interface ExternalDocumentationObject {
//     description?: string;
//     url: string;
//   }
  
//   interface ParameterObject {
//     name: string;
//     in: string;
//     description?: string;
//     required?: boolean;
//     deprecated?: boolean;
//     allowEmptyValue?: boolean;
//     style?: string;
//     explode?: boolean;
//     allowReserved?: boolean;
//     schema?: SchemaObject | ReferenceObject;
//     example?: any;
//     examples?: { [media: string]: ExampleObject | ReferenceObject };
//     content?: { [media: string]: MediaTypeObject };
//   }
  
//   interface RequestBodyObject {
//     description?: string;
//     content: { [media: string]: MediaTypeObject };
//     required?: boolean;
//   }
  
//   interface MediaTypeObject {
//     schema?: SchemaObject | ReferenceObject;
//     example?: any;
//     examples?: { [media: string]: ExampleObject | ReferenceObject };
//     encoding?: { [media: string]: EncodingObject };
//   }
  
//   interface EncodingObject {
//     contentType?: string;
//     headers?: { [header: string]: HeaderObject | ReferenceObject };
//     style?: string;
//     explode?: boolean;
//     allowReserved?: boolean;
//   }
  
//   interface ResponsesObject {
//     [statusCode: string]: ResponseObject | ReferenceObject;
//   }
  
//   interface ResponseObject {
//     description: string;
//     headers?: { [header: string]: HeaderObject | ReferenceObject };
//     content?: { [media: string]: MediaTypeObject };
//     links?: { [link: string]: LinkObject | ReferenceObject };
//   }
  
//   interface SchemaObject {
//     title?: string;
//     multipleOf?: number;
//     maximum?: number;
//     exclusiveMaximum?: boolean;
//     minimum?: number;
//     exclusiveMinimum?: boolean;
//     maxLength?: number;
//     minLength?: number;
//     pattern?: string;
//     maxItems?: number;
//     minItems?: number;
//     uniqueItems?: boolean;
//     maxProperties?: number;
//     minProperties?: number;
//     required?: string[];
//     enum?: any[];
//     type?: string;
//     allOf?: (SchemaObject | ReferenceObject)[];
//     oneOf?: (SchemaObject | ReferenceObject)[];
//     anyOf?: (SchemaObject | ReferenceObject)[];
//     not?: SchemaObject | ReferenceObject;
//     items?: SchemaObject | ReferenceObject;
//     properties?: { [name: string]: SchemaObject | ReferenceObject };
//     additionalProperties?: boolean | SchemaObject | ReferenceObject;
//     description?: string;
//     format?: string;
//     default?: any;
//     nullable?: boolean;
//     discriminator?: DiscriminatorObject;
//     readOnly?: boolean;
//     writeOnly?: boolean;
//     xml?: XMLObject;
//     externalDocs?: ExternalDocumentationObject;
//     example?: any;
//     deprecated?: boolean;
//   }
  
//   interface DiscriminatorObject {
//     propertyName: string;
//     mapping?: { [value: string]: string };
//   }
  
//   interface XMLObject {
//     name?: string;
//     namespace?: string;
//     prefix?: string;
//     attribute?: boolean;
//     wrapped?: boolean;
//   }
  
//   interface ReferenceObject {
//     $ref: string;
//   }
  
//   interface ExampleObject {
//     summary?: string;
//     description?: string;
//     value?: any;
//     externalValue?: string;
//   }
  
//   interface HeaderObject {
//     description?: string;
//     required?: boolean;
//     deprecated?: boolean;
//     allowEmptyValue?: boolean;
//     style?: string;
//     explode?: boolean;
//     allowReserved?: boolean;
//     schema?: SchemaObject | ReferenceObject;
//     example?: any;
//     examples?: { [media: string]: ExampleObject | ReferenceObject };
//     content?: { [media: string]: MediaTypeObject };
//   }
  
//   interface TagObject {
//     name: string;
//     description?: string;
//     externalDocs?: ExternalDocumentationObject;
//   }
  
//   interface SecurityRequirementObject {
//     [name: string]: string[];
//   }
  
//   interface ComponentsObject {
//     schemas?: { [schema: string]: SchemaObject | ReferenceObject };
//     responses?: { [response: string]: ResponseObject | ReferenceObject };
//     parameters?: { [parameter: string]: ParameterObject | ReferenceObject };
//     examples?: { [example: string]: ExampleObject | ReferenceObject };
//     requestBodies?: { [requestBody: string]: RequestBodyObject | ReferenceObject };
//     headers?: { [header: string]: HeaderObject | ReferenceObject };
//     securitySchemes?: { [securityScheme: string]: SecuritySchemeObject | ReferenceObject };
//     links?: { [link: string]: LinkObject | ReferenceObject };
//     callbacks?: { [callback: string]: CallbackObject | ReferenceObject };
//   }
  
//   interface SecuritySchemeObject {
//     type: string;
//     description?: string;
//     name?: string;
//     in?: string;
//     scheme?: string;
//     bearerFormat?: string;
//     flows?: OAuthFlowsObject;
//     openIdConnectUrl?: string;
//   }
  
//   interface OAuthFlowsObject {
//     implicit?: OAuthFlowObject;
//     password?: OAuthFlowObject;
//     clientCredentials?: OAuthFlowObject;
//     authorizationCode?: OAuthFlowObject;
//   }
  
//   interface OAuthFlowObject {
//     authorizationUrl: string;
//     tokenUrl: string;
//     refreshUrl?: string;
//     scopes: { [scope: string]: string };
//   }
  
//   interface LinkObject {
//     operationRef?: string;
//     operationId?: string;
//     parameters?: { [parameter: string]: any | string };
//     requestBody?: any | string;
//     description?: string;
//     server?: ServerObject;
//   }
  
//   interface CallbackObject {
//     [expression: string]: PathItemObject;
//   }
  