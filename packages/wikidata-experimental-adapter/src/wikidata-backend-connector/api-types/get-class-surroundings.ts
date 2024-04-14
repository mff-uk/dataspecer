import { buildEntityMap } from "./utils/build-entity-map";
import { WdClassHierarchySurroundingsDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId, EntityIdsList } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface GetClassSurroundingsResponseResults {
  readonly startClassId: EntityId;
  readonly parentsIds: EntityIdsList;
  readonly subjectOfIds: EntityIdsList;
  readonly valueOfIds: EntityIdsList;
  readonly classes: WdClassHierarchySurroundingsDescOnly[];
  readonly properties: WdPropertyDescOnly[];
}

export interface GetClassSurroundingsResponse {
  readonly results: GetClassSurroundingsResponseResults;
}

export class ClassSurroundings {
  readonly startClassId: EntityId;
  readonly parentsIds: EntityIdsList;
  readonly subjectOfIds: EntityIdsList;
  readonly valueOfIds: EntityIdsList;
  readonly classesMap: ReadonlyMap<EntityId, WdClassHierarchySurroundingsDescOnly>;
  readonly propertiesMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;

  constructor(response: GetClassSurroundingsResponse) {
    this.startClassId = response.results.startClassId;
    this.parentsIds = response.results.parentsIds;
    this.subjectOfIds = response.results.subjectOfIds
    this.valueOfIds = response.results.valueOfIds
    this.classesMap = buildEntityMap(response.results.classes)
    this.propertiesMap = buildEntityMap(response.results.properties)
  }
}
