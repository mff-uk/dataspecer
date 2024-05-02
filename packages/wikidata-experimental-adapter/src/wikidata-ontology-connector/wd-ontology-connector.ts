import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { WdEntityId } from "../wikidata-entities/wd-entity";
import { WdGetSearchResponse, WdSearchResults } from "./api-types/get-search";
import { WdErrorResponse, isWdErrorResponse } from "./api-types/error";
import {
    WdClassPropertyEndpoints,
    WdDomainsOrRanges,
    WdGetClassPropertyEndpointsResponse,
    WdBaseOrInheritOrder,
} from "./api-types/get-class-property-endpoints";
import { WdClassWithSurroundingsDesc, WdGetClassWithSurroundingsDescResponse } from "./api-types/get-class";
import { WdGetPropertyWithSurroundingDescResponse, WdPropertyWithSurroundingDesc } from "./api-types/get-property";
import { WdClassHierarchy, WdGetClassHierarchyResponse, WdHierarchyPart } from "./api-types/get-class-hierarchy";
import { WdClassSurroundings, WdGetClassSurroundingsResponse } from "./api-types/get-class-surroundings";
import { WdFilterByInstance, WdGetFilterByInstanceResponse } from "./api-types/get-filter-by-instance";

export class WdOntologyConnector {
    private readonly httpFetch: HttpFetch;
    public readonly BASE_URL: string;
    private addBaseUrlPrefix = (urlPath: string) => this.BASE_URL + urlPath;
    private readonly API_ENDPOINTS = {
        getSearchUrl: (query: string) => this.addBaseUrlPrefix(`/search?query=${encodeURI(query)}&searchClasses=true`),
        getClassUrl: (classId: WdEntityId) => this.addBaseUrlPrefix(`/classes/${classId}`),
        getPropertyUrl: (propertyId: WdEntityId) => this.addBaseUrlPrefix(`/properties/${propertyId}`),
        getHierarchyUrl: (classId: WdEntityId, part: WdHierarchyPart) => this.addBaseUrlPrefix(`/classes/${classId}/hierarchy?part=${part}`),
        getSurroundingsUrl: (classId: WdEntityId) => this.addBaseUrlPrefix(`/classes/${classId}/surroundings`),
        getFilterByInstanceUrl: (instanceUrl: string) => this.addBaseUrlPrefix(`/filter-by-instance?url=${encodeURI(instanceUrl)}`),
        getClassPropertyEndpointsUrl: (classId: WdEntityId, propertyId: WdEntityId, domainsOrRanges: WdDomainsOrRanges, order: WdBaseOrInheritOrder) =>
            this.addBaseUrlPrefix(`/classes/${classId}/properties/${propertyId}/${domainsOrRanges}?order=${order}`),
    };

    constructor(httpFetch: HttpFetch, baseUrl: string) {
        this.httpFetch = httpFetch;
        this.BASE_URL = baseUrl;
    }

    private async callFetch<RespType, RetType>(url, RetCreator: { new (response: RespType): RetType }): Promise<RetType | WdErrorResponse> {
        const response = (await (await this.httpFetch(url)).json()) as object;
        if (isWdErrorResponse(response)) {
            return response;
        } else return new RetCreator(response as RespType);
    }

    public async getSearch(query: string): Promise<WdSearchResults | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getSearchUrl(query);
        return await this.callFetch<WdGetSearchResponse, WdSearchResults>(url, WdSearchResults);
    }

    public async getClass(classId: WdEntityId): Promise<WdClassWithSurroundingsDesc | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getClassUrl(classId);
        return await this.callFetch<WdGetClassWithSurroundingsDescResponse, WdClassWithSurroundingsDesc>(url, WdClassWithSurroundingsDesc);
    }

    public async getProperty(propertyId: WdEntityId): Promise<WdPropertyWithSurroundingDesc | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getPropertyUrl(propertyId);
        return await this.callFetch<WdGetPropertyWithSurroundingDescResponse, WdPropertyWithSurroundingDesc>(url, WdPropertyWithSurroundingDesc);
    }

    public async getClassHierarchy(classId: WdEntityId, part: WdHierarchyPart): Promise<WdClassHierarchy | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getHierarchyUrl(classId, part);
        return await this.callFetch<WdGetClassHierarchyResponse, WdClassHierarchy>(url, WdClassHierarchy);
    }

    public async getClassSurroundings(classId: WdEntityId): Promise<WdClassSurroundings | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getSurroundingsUrl(classId);
        return await this.callFetch<WdGetClassSurroundingsResponse, WdClassSurroundings>(url, WdClassSurroundings);
    }

    public async getFilterByInstance(instanceUri: string): Promise<WdFilterByInstance | WdErrorResponse> {
        const clearedInstanceUri = instanceUri.split(/[?#]/)[0];
        const url = this.API_ENDPOINTS.getFilterByInstanceUrl(clearedInstanceUri);
        return await this.callFetch<WdGetFilterByInstanceResponse, WdFilterByInstance>(url, WdFilterByInstance);
    }

    public async getClassPropertyEndpoints(
        classId: WdEntityId,
        propertyId: WdEntityId,
        domainsOrRanges: WdDomainsOrRanges,
        order: WdBaseOrInheritOrder,
    ): Promise<WdClassPropertyEndpoints | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getClassPropertyEndpointsUrl(classId, propertyId, domainsOrRanges, order);
        return await this.callFetch<WdGetClassPropertyEndpointsResponse, WdClassPropertyEndpoints>(url, WdClassPropertyEndpoints);
    }
}
