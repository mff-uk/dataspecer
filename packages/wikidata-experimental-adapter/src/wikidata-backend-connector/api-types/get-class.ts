import { buildEntityMap } from "./utils/build-entity-map";
import { WdClass, WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface GetClassWithSurroundingsDescResponseResults {
  readonly class: WdClass;
  readonly surroundingClassesDesc: WdClassDescOnly[];
  readonly surroundingPropertiesDesc: WdPropertyDescOnly[];
}

export interface GetClassWithSurroundingsDescResponse {
  readonly results: GetClassWithSurroundingsDescResponseResults;
}

export class ClassWithSurroundingsDesc {
  readonly class: WdClass;
  readonly surroundingClassesDescMap: ReadonlyMap<EntityId, WdClassDescOnly>;
  readonly surroundingPropertiesDescMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;

  constructor(response: GetClassWithSurroundingsDescResponse) {
    this.class = response.results.class;
    this.surroundingClassesDescMap = buildEntityMap(response.results.surroundingClassesDesc)
    this.surroundingPropertiesDescMap = buildEntityMap(response.results.surroundingPropertiesDesc)
  }
}