import { buildEntityMap } from "./utils/build-entity-map.ts";
import { WdClassHierarchySurroundingsDescOnly } from "../../wikidata-entities/wd-class.ts";
import { WdEntityId, WdEntityIdsList } from "../../wikidata-entities/wd-entity.ts";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property.ts";

export interface WdGetClassSurroundingsResponseResults {
    readonly startClassId: WdEntityId;
    readonly parentsIds: WdEntityIdsList;
    readonly subjectOfIds: WdEntityIdsList;
    readonly valueOfIds: WdEntityIdsList;
    readonly classes: WdClassHierarchySurroundingsDescOnly[];
    readonly properties: WdPropertyDescOnly[];
}

export interface WdGetClassSurroundingsResponse {
    readonly results: WdGetClassSurroundingsResponseResults;
}

export class WdClassSurroundings {
    readonly startClassId: WdEntityId;
    readonly parentsIds: WdEntityIdsList;
    readonly subjectOfIds: WdEntityIdsList;
    readonly valueOfIds: WdEntityIdsList;
    readonly classesMap: ReadonlyMap<WdEntityId, WdClassHierarchySurroundingsDescOnly>;
    readonly propertiesMap: ReadonlyMap<WdEntityId, WdPropertyDescOnly>;

    constructor(response: WdGetClassSurroundingsResponse) {
        this.startClassId = response.results.startClassId;
        this.parentsIds = response.results.parentsIds;
        this.subjectOfIds = response.results.subjectOfIds;
        this.valueOfIds = response.results.valueOfIds;
        this.classesMap = buildEntityMap(response.results.classes);
        this.propertiesMap = buildEntityMap(response.results.properties);
    }
}
