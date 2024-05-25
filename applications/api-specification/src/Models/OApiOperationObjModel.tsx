export interface OApiOperationObj {
    summary: any;
    operationId: any;
    parameters: any[];
    requestBody?: any;
    responses: {
        [x: number]:
        {
            description: string;
            content:
            {
                'application/json':
                {
                    schema: { $ref: string; };
                };
            };
        };
    };
}