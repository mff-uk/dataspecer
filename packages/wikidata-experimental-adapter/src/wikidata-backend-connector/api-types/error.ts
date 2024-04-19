export interface WdErrorResponse {
    statusCode?: number,
    error: string,
    message?: string
}

export function isWdErrorResponse(response: object | undefined): response is WdErrorResponse {
    if (response != null) {
        return 'error' in response;
    } else return false;
} 