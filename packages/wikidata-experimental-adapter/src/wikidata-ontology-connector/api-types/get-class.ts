import { buildEntityMap } from "./utils/build-entity-map.ts";
import { WdClass, WdClassDescOnly, WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class.ts";
import { WdEntityId, WdEntityIdsList } from "../../wikidata-entities/wd-entity.ts";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property.ts";

export interface WdGetClassWithSurroundingsDescResponseResults {
    readonly startClass: WdClass;
    readonly parentsIds: WdEntityIdsList;
    readonly subjectOfIds: WdEntityIdsList;
    readonly valueOfIds: WdEntityIdsList;
    readonly surroundingClassesDesc: WdClassHierarchyDescOnly[];
    readonly surroundingPropertiesDesc: WdPropertyDescOnly[];
}

export interface WdGetClassWithSurroundingsDescResponse {
    readonly results: WdGetClassWithSurroundingsDescResponseResults;
}

export class WdClassWithSurroundingsDesc {
    readonly startClass: WdClass;
    readonly parentsIds: WdEntityIdsList;
    readonly subjectOfIds: WdEntityIdsList;
    readonly valueOfIds: WdEntityIdsList;
    readonly surroundingClassesDescMap: ReadonlyMap<WdEntityId, WdClassHierarchyDescOnly>;
    readonly surroundingPropertiesDescMap: ReadonlyMap<WdEntityId, WdPropertyDescOnly>;

    constructor(response: WdGetClassWithSurroundingsDescResponse) {
        this.startClass = response.results.startClass;
        this.parentsIds = response.results.parentsIds
        this.subjectOfIds = response.results.subjectOfIds
        this.valueOfIds = response.results.valueOfIds
        this.surroundingClassesDescMap = buildEntityMap(response.results.surroundingClassesDesc);
        this.surroundingPropertiesDescMap = buildEntityMap(
            response.results.surroundingPropertiesDesc,
        );
    }
}
