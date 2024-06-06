import { buildEntityMap } from "./utils/build-entity-map";
import { WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class";
import { WdEntityId } from "../../wikidata-entities/wd-entity";
import { WdProperty, WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface WdGetPropertyWithSurroundingDescResponseResults {
    readonly startProperty: WdProperty;
    readonly surroundingClassesDesc: WdClassHierarchyDescOnly[];
    readonly surroundingPropertiesDesc: WdPropertyDescOnly[];
}

export interface WdGetPropertyWithSurroundingDescResponse {
    readonly results: WdGetPropertyWithSurroundingDescResponseResults;
}

export class WdPropertyWithSurroundingDesc {
    readonly startProperty: WdProperty;
    readonly surroundingClassesDescMap: ReadonlyMap<WdEntityId, WdClassHierarchyDescOnly>;
    readonly surroundingPropertiesDescMap: ReadonlyMap<WdEntityId, WdPropertyDescOnly>;

    constructor(response: WdGetPropertyWithSurroundingDescResponse) {
        this.startProperty = response.results.startProperty;
        this.surroundingClassesDescMap = buildEntityMap(response.results.surroundingClassesDesc);
        this.surroundingPropertiesDescMap = buildEntityMap(
            response.results.surroundingPropertiesDesc,
        );
    }
}
