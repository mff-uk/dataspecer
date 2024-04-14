import { WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class";

export type DomainsOrRanges = 'domains' | 'ranges';
export type OwnOrInherited = 'own' | 'inherited';

export interface ClassPropertyDomainRangeResponseResults {
  classes: WdClassHierarchyDescOnly[];
}

export interface GetClassPropertyDomainRangeResponse {
  results: ClassPropertyDomainRangeResponseResults;
}