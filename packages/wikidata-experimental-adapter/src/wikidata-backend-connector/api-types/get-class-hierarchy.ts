import { WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class"
import { EntityId, EntityIdsList } from "../../wikidata-entities/wd-entity";
import { buildEntityMap } from "./utils/build-entity-map";

export type HierarchyPart = 'full' | 'parents' | 'children'

export interface GetClassHierarchyResponseResults {
    readonly startClassId: EntityId;
    readonly parentsIds: EntityIdsList;
    readonly childrenIds: EntityIdsList;
    readonly classes: WdClassHierarchyDescOnly[];
}

export interface GetClassHierarchyResponse {
    readonly results: GetClassHierarchyResponseResults;
}

export class ClassHierarchy {
    readonly startClassId: EntityId;
    readonly parentsIds: EntityIdsList;
    readonly childrenIds: EntityIdsList;
    readonly classesMap: ReadonlyMap<EntityId, WdClassHierarchyDescOnly>;

    constructor(response: GetClassHierarchyResponse) {
        this.startClassId = response.results.startClassId;
        this.parentsIds = response.results.parentsIds;
        this.childrenIds = response.results.childrenIds;
        this.classesMap = buildEntityMap(response.results.classes);
    }
}