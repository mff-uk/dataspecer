export type LanguageMap = Record<string, string>;

export type EntityId = number;
export type EntityIdsList = readonly EntityId[];

export type ExternalEntityId = string;
export type ExternalOntologyMapping = readonly ExternalEntityId[];

export enum EntityTypes {
  CLASS,
  PROPERTY,
}

export interface IWdEntity {
  readonly id: EntityId;
  readonly labels: LanguageMap;
  readonly descriptions: LanguageMap;
  readonly instanceOf: EntityIdsList;
}