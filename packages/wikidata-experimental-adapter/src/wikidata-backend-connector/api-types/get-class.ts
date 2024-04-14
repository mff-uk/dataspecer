import { buildEntityMap } from "./build-entity-map";
import { WdClass, WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface ClassWithSurroundingsNamesResponseResults {
  readonly classes: WdClass[];
  readonly surroundingClassesDecs: WdClassDescOnly[];
  readonly surroundingPropertiesDecs: WdPropertyDescOnly[];
}

export interface GetClassWithSurroundingsNamesResponse {
  readonly results: ClassWithSurroundingsNamesResponseResults;
}

export interface ClassWithSurroundingsDesc {
  readonly class: WdClass;
  readonly surroundingClassesDecsMap: ReadonlyMap<EntityId, WdClassDescOnly>;
  readonly surroundingPropertiesDecsMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;
}