import { EntityId, EntityIdsList } from "../../wikidata-entities/wd-entity";

export interface FilterPropertyRecordResults {
  readonly propertyId: EntityId;
  readonly rangeIds: EntityIdsList;
}

export interface FilterByInstanceResults {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: FilterPropertyRecordResults[];
  readonly valueOfFilterRecords: FilterPropertyRecordResults[];
}

export interface GetFilterByInstanceResponse {
  readonly results: FilterByInstanceResults;
}

export interface FilterByInstance {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;
  readonly valueOfFilterRecordsMap: ReadonlyMap<EntityId, EntityIdsList>;
}