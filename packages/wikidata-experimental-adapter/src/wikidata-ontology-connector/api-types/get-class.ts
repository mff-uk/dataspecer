import { buildEntityMap } from "./utils/build-entity-map";
import { WdClass, WdClassDescOnly } from "../../wikidata-entities/wd-class";
import { WdEntityId, WdEntityIdsList } from "../../wikidata-entities/wd-entity";
import { WdPropertyDescOnly } from "../../wikidata-entities/wd-property";

export interface WdGetClassWithSurroundingsDescResponseResults {
    readonly startClass: WdClass;
    readonly parentsIds: WdEntityIdsList;
    readonly subjectOfIds: WdEntityIdsList;
    readonly valueOfIds: WdEntityIdsList;
    readonly surroundingClassesDesc: WdClassDescOnly[];
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
    readonly surroundingClassesDescMap: ReadonlyMap<WdEntityId, WdClassDescOnly>;
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
