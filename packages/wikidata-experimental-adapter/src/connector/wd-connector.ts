import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { IErrorResponse, IGetClassResponse, IHierarchyResponse, ISearchResponse, ISurroundingsResponse } from "./response";

export class WdConnector {
    private readonly BASE_URL = "http://localhost:3042/api/v1";
    private readonly API_ENDPOINTS = {
        search: (query: string) => this.BASE_URL + `/search?query=${encodeURI(query)}`,
        getClass: (id: number) => this.BASE_URL + `/classes/${id}`,
        hierarchy: (id: number, part: 'full' | 'parents' | 'children' ) => this.BASE_URL + `/classes/${id}/hierarchy?part=${part}`,
        surroundings: (id: number) => this.BASE_URL + `/classes/${id}/surroundings`,
    };

    private readonly httpFetch: HttpFetch;

    constructor(httpFetch: HttpFetch) {
        this.httpFetch = httpFetch;
    }

    private isIErrorResponse(response: object): boolean {
        return 'statusCode' in response && 
               'message' in response && 
               'error' in response;
    } 

    public async search(query: string): Promise<ISearchResponse | null> {
        const url = this.API_ENDPOINTS.search(query);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? null : resp as ISearchResponse;
    }

    public async getClass(id: number): Promise<IGetClassResponse | null> {
        const url = this.API_ENDPOINTS.getClass(id);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? null : resp as IGetClassResponse;
    }

    public async hierarchy(id: number): Promise<IHierarchyResponse | null> {
        const url = this.API_ENDPOINTS.hierarchy(id, 'parents');
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? null : resp as IHierarchyResponse;
    }

    public async surroundings(id: number): Promise<ISurroundingsResponse | null> {
        const url = this.API_ENDPOINTS.surroundings(id);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? null : resp as ISurroundingsResponse;
    }
}