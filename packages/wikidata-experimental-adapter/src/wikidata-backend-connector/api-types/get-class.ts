import { buildEntityMap } from "./utils/build-entity-map";
import { WdClass, WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { WdEntityId } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface WdGetClassWithSurroundingsDescResponseResults {
  readonly class: WdClass;
  readonly surroundingClassesDesc: WdClassDescOnly[];
  readonly surroundingPropertiesDesc: WdPropertyDescOnly[];
}

export interface WdGetClassWithSurroundingsDescResponse {
  readonly results: WdGetClassWithSurroundingsDescResponseResults;
}

export class WdClassWithSurroundingsDesc {
  readonly class: WdClass;
  readonly surroundingClassesDescMap: ReadonlyMap<WdEntityId, WdClassDescOnly>;
  readonly surroundingPropertiesDescMap: ReadonlyMap<WdEntityId, WdPropertyDescOnly>;

  constructor(response: WdGetClassWithSurroundingsDescResponse) {
    this.class = response.results.class;
    this.surroundingClassesDescMap = buildEntityMap(response.results.surroundingClassesDesc)
    this.surroundingPropertiesDescMap = buildEntityMap(response.results.surroundingPropertiesDesc)
  }
}