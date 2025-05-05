import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { WdEntityId } from "../wikidata-entities/wd-entity.ts";
import { WdGetSearchResponse, WdSearchResults } from "./api-types/get-search.ts";
import { WdErrorResponse, isWdErrorResponse } from "./api-types/error.ts";
import {
    WdClassPropertyEndpoints,
    WdDomainsOrRanges,
    WdGetClassPropertyEndpointsResponse,
    WdBaseOrInheritOrder,
} from "./api-types/get-class-property-endpoints.ts";
import { WdClassWithSurroundingsDesc, WdGetClassWithSurroundingsDescResponse } from "./api-types/get-class.ts";
import { WdGetPropertyWithSurroundingDescResponse, WdPropertyWithSurroundingDesc } from "./api-types/get-property.ts";
import { WdClassHierarchy, WdGetClassHierarchyResponse, WdHierarchyPart } from "./api-types/get-class-hierarchy.ts";
import { WdClassSurroundings, WdGetClassSurroundingsResponse } from "./api-types/get-class-surroundings.ts";
import { WdFilterByInstance, WdGetFilterByInstanceResponse } from "./api-types/get-filter-by-instance.ts";
import { WdPostSearchResponse, WdPostSearchResults, WdSearchClassesConfig, WdSearchPropertiesConfig } from "./api-types/post-experimental-search.ts";
import { WdClassHierarchyDescOnly } from "../wikidata-entities/wd-class.ts";
import { WdPropertyDescOnly } from "../wikidata-entities/wd-property.ts";

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
        postClassSearch: () => this.addBaseUrlPrefix("/search-classes"),
        postPropertySearch: () => this.addBaseUrlPrefix("/search-properties"),
    };

    constructor(httpFetch: HttpFetch, baseUrl: string) {
        this.httpFetch = httpFetch;
        this.BASE_URL = baseUrl;
    }

    private async callGetFetch<RespType, RetType>(url, RetCreator: { new (response: RespType): RetType }): Promise<RetType | WdErrorResponse> {
        const response = (await (await this.httpFetch(url)).json()) as object;
        if (isWdErrorResponse(response)) {
            return response;
        } else return new RetCreator(response as RespType);
    }

    private async callPostFetch<PostData, RespType, RetType>(data: PostData, url, RetCreator: { new (response: RespType): RetType }): Promise<RetType | WdErrorResponse> {
        const response = (await (await this.httpFetch(url, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })).json()) as object;
        if (isWdErrorResponse(response)) {
            return response;
        } else return new RetCreator(response as RespType);
    }

    public async getSearch(query: string): Promise<WdSearchResults | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getSearchUrl(query);
        return await this.callGetFetch<WdGetSearchResponse, WdSearchResults>(url, WdSearchResults);
    }

    public async getClass(classId: WdEntityId): Promise<WdClassWithSurroundingsDesc | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getClassUrl(classId);
        return await this.callGetFetch<WdGetClassWithSurroundingsDescResponse, WdClassWithSurroundingsDesc>(url, WdClassWithSurroundingsDesc);
    }

    public async getProperty(propertyId: WdEntityId): Promise<WdPropertyWithSurroundingDesc | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getPropertyUrl(propertyId);
        return await this.callGetFetch<WdGetPropertyWithSurroundingDescResponse, WdPropertyWithSurroundingDesc>(url, WdPropertyWithSurroundingDesc);
    }

    public async getClassHierarchy(classId: WdEntityId, part: WdHierarchyPart): Promise<WdClassHierarchy | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getHierarchyUrl(classId, part);
        return await this.callGetFetch<WdGetClassHierarchyResponse, WdClassHierarchy>(url, WdClassHierarchy);
    }

    public async getClassSurroundings(classId: WdEntityId): Promise<WdClassSurroundings | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getSurroundingsUrl(classId);
        return await this.callGetFetch<WdGetClassSurroundingsResponse, WdClassSurroundings>(url, WdClassSurroundings);
    }

    public async getFilterByInstance(instanceUri: string): Promise<WdFilterByInstance | WdErrorResponse> {
        const clearedInstanceUri = instanceUri.split(/[?#]/)[0];
        const url = this.API_ENDPOINTS.getFilterByInstanceUrl(clearedInstanceUri);
        return await this.callGetFetch<WdGetFilterByInstanceResponse, WdFilterByInstance>(url, WdFilterByInstance);
    }

    public async postSearchClasses(config: WdSearchClassesConfig): Promise<WdPostSearchResults<WdClassHierarchyDescOnly> | WdErrorResponse> {
        const url = this.API_ENDPOINTS.postClassSearch();
        return await this.callPostFetch<WdSearchClassesConfig, WdPostSearchResponse<WdClassHierarchyDescOnly>, WdPostSearchResults<WdClassHierarchyDescOnly>>(config, url, WdPostSearchResults<WdClassHierarchyDescOnly>);
    }

    public async postSearchProperties(config: WdSearchPropertiesConfig): Promise<WdPostSearchResults<WdPropertyDescOnly> | WdErrorResponse> {
        const url = this.API_ENDPOINTS.postPropertySearch();
        return await this.callPostFetch<WdSearchPropertiesConfig, WdPostSearchResponse<WdPropertyDescOnly>, WdPostSearchResults<WdPropertyDescOnly>>(config, url, WdPostSearchResults<WdPropertyDescOnly>);
    }

    public async getClassPropertyEndpoints(
        classId: WdEntityId,
        propertyId: WdEntityId,
        domainsOrRanges: WdDomainsOrRanges,
        order: WdBaseOrInheritOrder,
    ): Promise<WdClassPropertyEndpoints | WdErrorResponse> {
        const url = this.API_ENDPOINTS.getClassPropertyEndpointsUrl(classId, propertyId, domainsOrRanges, order);
        return await this.callGetFetch<WdGetClassPropertyEndpointsResponse, WdClassPropertyEndpoints>(url, WdClassPropertyEndpoints);
    }
}
