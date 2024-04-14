import { WdClass } from "../../wikidata-entities/wd-class"

export type HierarchyPart = 'full' | 'parents' | 'children'

export interface HierarchyResults {
    readonly root: WdClass
    readonly parents: WdClass[]
    readonly children: WdClass[]
}

export interface HierarchyResponse {
    readonly results: HierarchyResults
}