import { WdClassDescOnly } from './wd-class';
import { WdPropertyDescOnly } from './wd-property';

export type LanguageMap = Record<string, string>;

export type LanugageArrayMap = Record<string, string[]>;

export type EntityId = number;
export type EntityIri = string;
export type EntityIdsList = readonly EntityId[];
export type EntityIriList = readonly EntityIri[];

export type ExternalEntityId = string;
export type ExternalOntologyMapping = readonly ExternalEntityId[];


export const WIKIDATA_URI_PREFIX = "http://www.wikidata.org/entity/";

export interface WdEntity {
  readonly id: EntityId;
  readonly iri: string;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
}

export function wdIriToNumId(wdIri: string): EntityId {
  return Number(wdIri.split("/").pop().slice(1));
}

export function concatWdPrefixWithId(id: string): string {
  return WIKIDATA_URI_PREFIX + id;
}

export function isEntityPropertyDesc(entity: WdEntityDescOnly): entity is WdPropertyDescOnly {
  return 'datatype' in entity;
}

export function isEntityClassDesc(entity: WdEntityDescOnly): entity is WdClassDescOnly {
  return !('datatype' in entity);
}

export type WdEntityDescOnly = Pick<WdEntity, 'id' | 'iri' | 'labels' | 'descriptions'>;
