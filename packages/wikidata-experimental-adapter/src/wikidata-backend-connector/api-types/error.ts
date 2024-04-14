export interface ErrorResponse {
    statusCode: number,
    error: string,
    message: string
}

export function isErrorResponse(response: object): response is ErrorResponse {
    return 'statusCode' in response && 
           'message' in response && 
           'error' in response;
} 