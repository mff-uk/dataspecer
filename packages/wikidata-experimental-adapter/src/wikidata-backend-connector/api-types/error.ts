export interface ErrorResponse {
    statusCode?: number,
    error: string,
    message?: string
}

export function isErrorResponse(response: object | undefined): response is ErrorResponse {
    if (response != null) {
        return 'error' in response;
    } else return false;
} 