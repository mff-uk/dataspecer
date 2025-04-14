import { WdClassDescOnly } from "./wd-class.ts";
import { WdPropertyDescOnly } from "./wd-property.ts";

export type WdLanguageMap = Record<string, string>;

export type WdLanugageArrayMap = Record<string, string[]>;

export type WdEntityId = number;
export type WdEntityIri = string;
export type WdEntityIdsList = readonly WdEntityId[];
export type WdEntityIriList = readonly WdEntityIri[];

export type WdExternalEntityId = string;
export type WdExternalOntologyMappings = readonly WdExternalEntityId[];

export const WIKIDATA_URI_PREFIX = "http://www.wikidata.org/entity/";

export interface WdEntity {
    readonly id: WdEntityId;
    readonly iri: string;
    readonly labels: WdLanguageMap;
    readonly descriptions: WdLanguageMap;
}

export function wdIriToNumId(wdIri: string): WdEntityId {
    return Number(wdIri.split("/").pop().slice(1));
}

export function concatWdPrefixWithId(id: string): string {
    return WIKIDATA_URI_PREFIX + id;
}

export function isWdEntityPropertyDesc(entity: WdEntityDescOnly): entity is WdPropertyDescOnly {
    return "datatype" in entity;
}

export function isWdEntityClassDesc(entity: WdEntityDescOnly): entity is WdClassDescOnly {
    return !("datatype" in entity);
}

export type WdEntityDescOnly = Pick<WdEntity, "id" | "iri" | "labels" | "descriptions">;
