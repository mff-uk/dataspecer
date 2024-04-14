import { EntityId, EntityIdsList } from "../../wikidata-entities/wd-entity";

export interface GetFilterPropertyRecordResponseResults {
  readonly propertyId: EntityId;
  readonly rangeIds: EntityIdsList;
}

export interface GetFilterByInstanceResponseResults {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: GetFilterPropertyRecordResponseResults[];
  readonly valueOfFilterRecords: GetFilterPropertyRecordResponseResults[];
}

export interface GetFilterByInstanceResponse {
  readonly results: GetFilterByInstanceResponseResults;
}

export class FilterByInstance {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;
  readonly valueOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;

  constructor(response: GetFilterByInstanceResponse) {
    this.instanceOfIds = response.results.instanceOfIds;
    this.subjectOfFilterRecordsMap = FilterByInstance.buildFilterPropertyRecordsMap(response.results.subjectOfFilterRecords);
    this.valueOfFilterRecordsMap = FilterByInstance.buildFilterPropertyRecordsMap(response.results.valueOfFilterRecords);
  }
  
  private static buildFilterPropertyRecordsMap(
      filterByInstaceRecords: GetFilterPropertyRecordResponseResults[],
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


