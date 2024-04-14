import { WdClassHierarchyDescOnly } from "../../wikidata-entities/wd-class";

export type DomainsOrRanges = 'domains' | 'ranges';
export type OwnOrInherited = 'own' | 'inherited';

export interface ClassPropertyEndpointsResponseResults {
  readonly classes: WdClassHierarchyDescOnly[];
}

export interface GetClassPropertyEndpointsResponse {
  readonly results: ClassPropertyEndpointsResponseResults;
}

export class ClassPropertyEndpoints {
  readonly classes: WdClassHierarchyDescOnly[];

  constructor(response: GetClassPropertyEndpointsResponse) {
    this.classes = response.results.classes;
  }
}