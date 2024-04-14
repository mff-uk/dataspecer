export interface ErrorResponse {
    statusCode?: number,
    error: string,
    message?: string
}

export function isErrorResponse(response: object): response is ErrorResponse {
    return 'error' in response;
} 