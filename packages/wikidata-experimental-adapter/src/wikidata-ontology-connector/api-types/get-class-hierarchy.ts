import { WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class";
import { WdEntityId, WdEntityIdsList } from "../../wikidata-entities/wd-entity";
import { buildEntityMap } from "./utils/build-entity-map";

export type WdHierarchyPart = "full" | "parents" | "children";

export interface WdGetClassHierarchyResponseResults {
    readonly startClassId: WdEntityId;
    readonly parentsIds: WdEntityIdsList;
    readonly childrenIds: WdEntityIdsList;
    readonly classes: WdClassHierarchyDescOnly[];
}

export interface WdGetClassHierarchyResponse {
    readonly results: WdGetClassHierarchyResponseResults;
}

export class WdClassHierarchy {
    readonly startClassId: WdEntityId;
    readonly parentsIds: WdEntityIdsList;
    readonly childrenIds: WdEntityIdsList;
    readonly classesMap: ReadonlyMap<WdEntityId, WdClassHierarchyDescOnly>;

    constructor(response: WdGetClassHierarchyResponse) {
        this.startClassId = response.results.startClassId;
        this.parentsIds = response.results.parentsIds;
        this.childrenIds = response.results.childrenIds;
        this.classesMap = buildEntityMap(response.results.classes);
    }
}
