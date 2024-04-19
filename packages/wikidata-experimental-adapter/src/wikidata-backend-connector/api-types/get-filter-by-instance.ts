import { WdEntityId, WdEntityIdsList } from "../../wikidata-entities/wd-entity";

export interface WdGetFilterPropertyRecordResponseResults {
  readonly propertyId: WdEntityId;
  readonly rangeIds: WdEntityIdsList;
}

export interface WdGetFilterByInstanceResponseResults {
  readonly instanceOfIds: WdEntityIdsList;
  readonly subjectOfFilterRecords: WdGetFilterPropertyRecordResponseResults[];
  readonly valueOfFilterRecords: WdGetFilterPropertyRecordResponseResults[];
}

export interface WdGetFilterByInstanceResponse {
  readonly results: WdGetFilterByInstanceResponseResults;
}

export class WdFilterByInstance {
  readonly instanceOfIds: WdEntityIdsList;
  readonly subjectOfFilterRecordsMap: ReadonlyMap<WdEntityId, WdEntityIdsList>;
  readonly valueOfFilterRecordsMap: ReadonlyMap<WdEntityId, WdEntityIdsList>;

  constructor(response: WdGetFilterByInstanceResponse) {
    this.instanceOfIds = response.results.instanceOfIds;
    this.subjectOfFilterRecordsMap = WdFilterByInstance.buildFilterPropertyRecordsMap(response.results.subjectOfFilterRecords);
    this.valueOfFilterRecordsMap = WdFilterByInstance.buildFilterPropertyRecordsMap(response.results.valueOfFilterRecords);
  }
  
  private static buildFilterPropertyRecordsMap(
      filterByInstaceRecords: WdGetFilterPropertyRecordResponseResults[],
    ): ReadonlyMap<WdEntityId, WdEntityIdsList> {
      const newMap = new Map<WdEntityId, WdEntityIdsList>();
      filterByInstaceRecords.forEach((record) => {
        if (!newMap.has(record.propertyId)) {
          newMap.set(record.propertyId, record.rangeIds);
        }
      });
      return newMap;
    }
}


