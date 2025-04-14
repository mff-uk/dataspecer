import { WdEntity, WdEntityIdsList, WdExternalOntologyMappings } from "./wd-entity.ts";

export const ROOT_CLASS_ID = 35120;

export interface WdClass extends WdEntity {
    readonly subclassOf: WdEntityIdsList;
    readonly equivalentExternalOntologyClasses: WdExternalOntologyMappings;

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
