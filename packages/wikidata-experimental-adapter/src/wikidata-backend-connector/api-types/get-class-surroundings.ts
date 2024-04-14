import { buildEntityMap } from "./build-entity-map";
import { WdClassHierarchySurroundingsDescOnly, WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId, EntityIdsList } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface SurroundingsResponseResults {
  readonly startClass: EntityId;
  readonly parents: EntityIdsList;
  readonly subjectOf: EntityIdsList;
  readonly valueOf: EntityIdsList;
  readonly classes: WdClassHierarchySurroundingsDescOnly[];
  readonly properties: WdPropertyDescOnly[];
}

export interface GetSurroundingsResponse {
  readonly results: SurroundingsResponseResults;
}

export interface ClassSurroundings {
  readonly startClassId: EntityId;
  readonly parentsIds: EntityIdsList;
  readonly subjectOfIds: EntityIdsList;
  readonly valueOfIds: EntityIdsList;
  readonly classesMap: ReadonlyMap<EntityId, WdClassHierarchySurroundingsDescOnly>;
  readonly propertiesMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;
}
