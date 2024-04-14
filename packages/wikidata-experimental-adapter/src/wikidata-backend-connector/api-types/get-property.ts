import { buildEntityMap } from "./build-entity-map";
import { WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId } from "../../wikidata-entities/wd-entity";
import { WdProperty, WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface PropertyWithSurroundingNamesResponseResults {
  readonly properties: WdProperty[];
  readonly surroundingClassesDecs: WdClassDescOnly[];
  readonly surroundingPropertiesDecs: WdPropertyDescOnly[];
}

export interface GetPropertyWithSurroundingNamesResponse {
  readonly results: PropertyWithSurroundingNamesResponseResults;
}

export interface PropertyWithSurroundingDecs {
  readonly property: WdProperty;
  readonly surroundingClassesDecsMap: ReadonlyMap<EntityId, WdClassDescOnly>;
  readonly surroundingPropertiesDecsMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;
}

