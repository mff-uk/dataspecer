import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { IGetClassResponse, IHierarchyResponse, ISearchResponse, ISurroundingsResponse } from "./response";
import { EntityId } from "./entities/wd-entity";

export class WdConnector {
    private readonly BASE_URL = "http://localhost:3042/api/v1";
    private readonly API_ENDPOINTS = {
        search: (query: string) => this.BASE_URL + `/search?query=${encodeURI(query)}`,
        getClass: (id: EntityId) => this.BASE_URL + `/classes/${id}`,
        hierarchy: (id: EntityId, part: 'full' | 'parents' | 'children' ) => this.BASE_URL + `/classes/${id}/hierarchy?part=${part}`,
        surroundings: (id: EntityId) => this.BASE_URL + `/classes/${id}/surroundings`,
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

    public async search(query: string): Promise<ISearchResponse | undefined> {
        const url = this.API_ENDPOINTS.search(query);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? undefined : resp as ISearchResponse;
    }

    public async getClass(id: EntityId): Promise<IGetClassResponse | undefined> {
        const url = this.API_ENDPOINTS.getClass(id);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? undefined : resp as IGetClassResponse;
    }

    public async hierarchy(id: EntityId): Promise<IHierarchyResponse | undefined> {
        const url = this.API_ENDPOINTS.hierarchy(id, 'parents');
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? undefined : resp as IHierarchyResponse;
    }

    public async surroundings(id: EntityId): Promise<ISurroundingsResponse | undefined> {
        const url = this.API_ENDPOINTS.surroundings(id);
        const resp = await ((await this.httpFetch(url)).json()) as object
        return this.isIErrorResponse(resp) ? undefined : resp as ISurroundingsResponse;
    }
}