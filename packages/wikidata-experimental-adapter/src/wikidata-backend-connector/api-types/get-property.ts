import { buildEntityMap } from "./utils/build-entity-map";
import { WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { EntityId } from "../../wikidata-entities/wd-entity";
import { WdProperty, WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface GetPropertyWithSurroundingDescResponseResults {
  readonly property: WdProperty;
  readonly surroundingClassesDesc: WdClassDescOnly[];
  readonly surroundingPropertiesDesc: WdPropertyDescOnly[];
}

export interface GetPropertyWithSurroundingDescResponse {
  readonly results: GetPropertyWithSurroundingDescResponseResults;
}

export class PropertyWithSurroundingDesc {
  readonly property: WdProperty;
  readonly surroundingClassesDescMap: ReadonlyMap<EntityId, WdClassDescOnly>;
  readonly surroundingPropertiesDescMap: ReadonlyMap<EntityId, WdPropertyDescOnly>;

  constructor(response: GetPropertyWithSurroundingDescResponse) {
    this.property = response.results.property;
    this.surroundingClassesDescMap = buildEntityMap(response.results.surroundingClassesDesc)
    this.surroundingPropertiesDescMap = buildEntityMap(response.results.surroundingPropertiesDesc)
  }
}

