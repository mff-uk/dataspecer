import { HttpFetch } from '@dataspecer/core/io/fetch/fetch-api';
import { EntityId } from '../wikidata-entities/wd-entity';
import { GetSearchResponse, SearchResults } from './api-types/get-search';
import { ErrorResponse, isErrorResponse } from './api-types/error';
import {
  ClassPropertyEndpoints,
  DomainsOrRanges,
  GetClassPropertyEndpointsResponse,
  OwnOrInherited,
} from './api-types/get-class-property-endpoints';
import {
  ClassWithSurroundingsDesc,
  GetClassWithSurroundingsDescResponse,
} from './api-types/get-class';
import {
  GetPropertyWithSurroundingDescResponse,
  PropertyWithSurroundingDesc,
} from './api-types/get-property';
import { ClassHierarchy, GetClassHierarchyResponse, HierarchyPart } from './api-types/get-class-hierarchy';
import { ClassSurroundings, GetClassSurroundingsResponse } from './api-types/get-class-surroundings';
import {
  FilterByInstance,
  GetFilterByInstanceResponse,
} from './api-types/get-filter-by-instance';

export class WdConnector {
  private readonly httpFetch: HttpFetch;
  private readonly BASE_URL = 'http://localhost:3042/api/v3';
  private addBaseUrlPrefix = (urlPath: string) => this.BASE_URL + urlPath;
  private readonly API_ENDPOINTS = {
    getSearchUrl: (query: string) =>
      this.addBaseUrlPrefix(`/search?query=${encodeURI(query)}&searchClasses=true`),
    getClassUrl: (classId: EntityId) => 
      this.addBaseUrlPrefix(`/classes/${classId}`),
    getPropertyUrl: (propertyId: EntityId) => 
      this.addBaseUrlPrefix(`/properties/${propertyId}`),
    getHierarchyUrl: (classId: EntityId, part: HierarchyPart) =>
      this.addBaseUrlPrefix(`/classes/${classId}/hierarchy?part=${part}`),
    getSurroundingsUrl: (classId: EntityId) =>
      this.addBaseUrlPrefix(`/classes/${classId}/surroundings`),
    getFilterByInstanceUrl: (instanceUrl: string) =>
      this.addBaseUrlPrefix(`/filter-by-instance?url=${encodeURI(instanceUrl)}`),
    getClassPropertyEndpointsUrl: (classId: EntityId, propertyId: EntityId, domainsOrRanges: DomainsOrRanges, ownOrInherited: OwnOrInherited) =>
      this.addBaseUrlPrefix(`/classes/${classId}/properties/${propertyId}/${domainsOrRanges}?part=${ownOrInherited}`)
  };

  constructor(httpFetch: HttpFetch) {
    this.httpFetch = httpFetch;
  }

  private async callFetch<RespType, RetType>(url, RetCreator: { new (response: RespType): RetType}): Promise<RetType | ErrorResponse> {
    const response = (await (await this.httpFetch(url)).json()) as object;
    if (isErrorResponse(response)) {
      return response;
    } else return new RetCreator(response as RespType);
  }

  public async getSearch(query: string): Promise<SearchResults | ErrorResponse> {
    const url = this.API_ENDPOINTS.getSearchUrl(query);
    return await this.callFetch<GetSearchResponse, SearchResults>(url, SearchResults);
  }

  public async getClass(classId: EntityId): Promise<ClassWithSurroundingsDesc | ErrorResponse> {
    const url = this.API_ENDPOINTS.getClassUrl(classId);
    return await this.callFetch<GetClassWithSurroundingsDescResponse, ClassWithSurroundingsDesc>(url, ClassWithSurroundingsDesc);
  }

  public async getProperty(propertyId: EntityId): Promise<PropertyWithSurroundingDesc | ErrorResponse> {
    const url = this.API_ENDPOINTS.getPropertyUrl(propertyId);
    return await this.callFetch<GetPropertyWithSurroundingDescResponse, PropertyWithSurroundingDesc>(url, PropertyWithSurroundingDesc);
  }

  public async getClassHierarchy(classId: EntityId, part: HierarchyPart): Promise<ClassHierarchy | ErrorResponse> {
    const url = this.API_ENDPOINTS.getHierarchyUrl(classId, part);
    return await this.callFetch<GetClassHierarchyResponse, ClassHierarchy>(url, ClassHierarchy);
  }

  public async getClassSurroundings(classId: EntityId): Promise<ClassSurroundings | ErrorResponse> {
    const url = this.API_ENDPOINTS.getSurroundingsUrl(classId);
    return await this.callFetch<GetClassSurroundingsResponse, ClassSurroundings>(url, ClassSurroundings);
  }

  public async getFilterByInstance(instanceUri: string): Promise<FilterByInstance | ErrorResponse> {
    const url = this.API_ENDPOINTS.getFilterByInstanceUrl(instanceUri);
    return await this.callFetch<GetFilterByInstanceResponse, FilterByInstance>(url, FilterByInstance);
  }

  public async getClassPropertyEndpoints(classId: EntityId, propertyId: EntityId, domainsOrRanges: DomainsOrRanges, ownOrInherited: OwnOrInherited
  ): Promise<ClassPropertyEndpoints | ErrorResponse> {
    const url = this.API_ENDPOINTS.getClassPropertyEndpointsUrl(classId, propertyId, domainsOrRanges, ownOrInherited);
    return await this.callFetch<GetClassPropertyEndpointsResponse, ClassPropertyEndpoints>(url, ClassPropertyEndpoints);
  }
}
