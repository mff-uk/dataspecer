import { WdClass } from "../../wikidata-entities/wd-class"

export type HierarchyPart = 'full' | 'parents' | 'children'

export interface GetClassHierarchyResponseResults {
    readonly startClass: WdClass;
    readonly parents: WdClass[];
    readonly children: WdClass[];
}

export interface GetClassHierarchyResponse {
    readonly results: GetClassHierarchyResponseResults;
}

export class ClassHierarchy {
    readonly startClass: WdClass;
    readonly parents: WdClass[];
    readonly children: WdClass[];

    constructor(response: GetClassHierarchyResponse) {
        this.startClass = response.results.startClass;
        this.parents = response.results.parents;
        this.children = response.results.children;
    }
}