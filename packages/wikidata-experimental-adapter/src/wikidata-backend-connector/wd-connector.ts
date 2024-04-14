import { HttpFetch } from '@dataspecer/core/io/fetch/fetch-api';
import { EntityId, EntityIdsList, WdEntityDescOnly } from '../wikidata-entities/wd-entity';
import { GetSearchResponse, SearchResults } from './api-types/get-search';
import { ErrorResponse, isErrorResponse } from './api-types/error';
import {
  DomainsOrRanges,
  GetClassPropertyDomainRangeResponse,
  OwnOrInherited,
} from './api-types/get-class-property-domain-range';
import {
  ClassWithSurroundingsDesc,
  GetClassWithSurroundingsNamesResponse,
} from './api-types/get-class';
import {
  GetPropertyWithSurroundingNamesResponse,
  PropertyWithSurroundingDecs,
} from './api-types/get-property';
import { HierarchyPart, HierarchyResponse, HierarchyResults } from './api-types/get-hierarchy';
import { ClassSurroundings, GetSurroundingsResponse } from './api-types/get-class-surroundings';
import {
  FilterByInstance,
  FilterPropertyRecordResults,
  GetFilterByInstanceResponse,
} from './api-types/get-filter-by-instance';
import { WdClassHierarchyDescOnly } from '../wikidata-entities/wd-class';

export class WdConnector {
  private readonly httpFetch: HttpFetch;
  private readonly BASE_URL = 'http://localhost:3042/api/v3';
  private addBaseUrlPrefix = (urlPath: string) => this.BASE_URL + urlPath;
  private readonly API_ENDPOINTS = {
    getSearchUrl: (query: string) =>
      this.addBaseUrlPrefix(`/search?query=${encodeURI(query)}&searchClasses=true`),
    getClassUrl: (classId: EntityId) => this.addBaseUrlPrefix(`/classes/${classId}`),
    getPropertyUrl: (propertyId: EntityId) => this.addBaseUrlPrefix(`/properties/${propertyId}`),
    getHierarchyUrl: (classId: EntityId, part: HierarchyPart) =>
      this.addBaseUrlPrefix(`/classes/${classId}/hierarchy?part=${part}`),
    getSurroundingsUrl: (classId: EntityId) =>
      this.addBaseUrlPrefix(`/classes/${classId}/surroundings`),
    getFilterByInstanceUrl: (instanceUrl: string) =>
      this.addBaseUrlPrefix(`/filter-by-instance?url=${encodeURI(instanceUrl)}`),
    getClassPropertyDomainsOrRangesUrl: (
      classId: EntityId,
      propertyId: EntityId,
      domainsOrRanges: DomainsOrRanges,
      ownOrInherited: OwnOrInherited,
    ) =>
      this.addBaseUrlPrefix(
        `/classes/${classId}/properties/${propertyId}/${domainsOrRanges}?part=${ownOrInherited}`,
      ),
  };

  constructor(httpFetch: HttpFetch) {
    this.httpFetch = httpFetch;
  }

  private async callFetch<T>(url): Promise<T | ErrorResponse> {
    const response = (await (await this.httpFetch(url)).json()) as object;
    if (isErrorResponse(response)) {
      return response;
    } else return response as T;
  }

  public async getSearch(query: string): Promise<SearchResults | ErrorResponse> {
    const url = this.API_ENDPOINTS.getSearchUrl(query);
    const response = await this.callFetch<GetSearchResponse>(url);
    if (!isErrorResponse(response)) return response.results;
    else return response;
  }

  public async getClass(classId: EntityId): Promise<ClassWithSurroundingsDesc | ErrorResponse> {
    const url = this.API_ENDPOINTS.getClassUrl(classId);
    const response = await this.callFetch<GetClassWithSurroundingsNamesResponse>(url);
    if (!isErrorResponse(response)) {
      return {
        class: response.results.classes[0],
        surroundingClassesDecsMap: this.buildEntityMap(response.results.surroundingClassesDecs),
        surroundingPropertiesDecsMap: this.buildEntityMap(
          response.results.surroundingPropertiesDecs,
        ),
      };
    } else return response;
  }

  public async getProperty(
    propertyId: EntityId,
  ): Promise<PropertyWithSurroundingDecs | ErrorResponse> {
    const url = this.API_ENDPOINTS.getPropertyUrl(propertyId);
    const response = await this.callFetch<GetPropertyWithSurroundingNamesResponse>(url);
    if (!isErrorResponse(response)) {
      return {
        property: response.results.properties[0],
        surroundingClassesDecsMap: this.buildEntityMap(response.results.surroundingClassesDecs),
        surroundingPropertiesDecsMap: this.buildEntityMap(
          response.results.surroundingPropertiesDecs,
        ),
      };
    } else return response;
  }

  public async getHierarchy(
    classId: EntityId,
    part: HierarchyPart,
  ): Promise<HierarchyResults | ErrorResponse> {
    const url = this.API_ENDPOINTS.getHierarchyUrl(classId, part);
    const response = await this.callFetch<HierarchyResponse>(url);
    if (!isErrorResponse(response)) return response.results;
    else return response;
  }

  public async getSurroundings(classId: EntityId): Promise<ClassSurroundings | ErrorResponse> {
    const url = this.API_ENDPOINTS.getSurroundingsUrl(classId);
    const response = await this.callFetch<GetSurroundingsResponse>(url);
    if (!isErrorResponse(response)) {
      return {
        startClassId: response.results.startClass,
        parentsIds: response.results.parents,
        subjectOfIds: response.results.subjectOf,
        valueOfIds: response.results.valueOf,
        classesMap: this.buildEntityMap(response.results.classes),
        propertiesMap: this.buildEntityMap(response.results.properties),
      };
    } else return response;
  }

  public async getFilterByInstance(instanceUri: string): Promise<FilterByInstance | ErrorResponse> {
    const url = this.API_ENDPOINTS.getFilterByInstanceUrl(instanceUri);
    const response = await this.callFetch<GetFilterByInstanceResponse>(url);
    if (!isErrorResponse(response)) {
      return {
        instanceOfIds: response.results.instanceOfIds,
        subjectOfFilterRecordsMap: this.buildFilterPropertyRecordsMap(
          response.results.subjectOfFilterRecords,
        ),
        valueOfFilterRecordsMap: this.buildFilterPropertyRecordsMap(
          response.results.subjectOfFilterRecords,
        ),
      };
    } else return response;
  }

  public async getClassPropertyDomainsOrRanges(
    classId: EntityId,
    propertyId: EntityId,
    domainsOrRanges: DomainsOrRanges,
    ownOrInherited: OwnOrInherited,
  ): Promise<WdClassHierarchyDescOnly[] | ErrorResponse> {
    const url = this.API_ENDPOINTS.getClassPropertyDomainsOrRangesUrl(
      classId,
      propertyId,
      domainsOrRanges,
      ownOrInherited,
    );
    const response = await this.callFetch<GetClassPropertyDomainRangeResponse>(url);
    if (!isErrorResponse(response)) {
      return response.results.classes;
    } else return response;
  }

  private buildEntityMap<T extends WdEntityDescOnly>(entities: T[]): ReadonlyMap<EntityId, T> {
    const newMap = new Map<EntityId, T>();
    entities.forEach((entity) => {
      if (!newMap.has(entity.id)) {
        newMap.set(entity.id, entity);
      }
    });
    return newMap;
  }

  private buildFilterPropertyRecordsMap(
    filterByInstaceRecords: FilterPropertyRecordResults[],
  ): ReadonlyMap<EntityId, EntityIdsList> {
    const newMap = new Map<EntityId, EntityIdsList>();
    filterByInstaceRecords.forEach((record) => {
      if (!newMap.has(record.propertyId)) {
        newMap.set(record.propertyId, record.rangeIds);
      }
    });
    return newMap;
  }
}
