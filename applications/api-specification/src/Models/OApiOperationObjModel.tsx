/* Model for Operation Object - for the generator */
export interface OApiOperationObj {
    summary: any;
    operationId: any;
    parameters: any[];
    requestBody?: any;
    responses: {
        [httpStatusCode: number]:
        {
            description: string;
            content?:
            {
                'application/json':
                {
                    schema: {};
                };
            };
        };
    };
}