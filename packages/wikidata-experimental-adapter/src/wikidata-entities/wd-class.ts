import { WdEntity, WdEntityIdsList, WdExternalOntologyMapping } from "./wd-entity";

export const ROOT_CLASS_ID = 35120;

export interface WdClass extends WdEntity {
    readonly subclassOf: WdEntityIdsList;
    readonly equivalentExternalOntologyClasses: WdExternalOntologyMapping;

    readonly subjectOfProperty: WdEntityIdsList;
    readonly valueOfProperty: WdEntityIdsList;
}

export type WdClassDescOnly = Pick<WdClass, "id" | "iri" | "labels" | "descriptions">;
export type WdClassHierarchyDescOnly = Pick<
    WdClass,
    "id" | "iri" | "labels" | "descriptions" | "subclassOf"
>;
export type WdClassHierarchySurroundingsDescOnly = Pick<
    WdClass,
    | "id"
    | "iri"
    | "labels"
    | "descriptions"
    | "subclassOf"
    | "subjectOfProperty"
    | "valueOfProperty"
>;
