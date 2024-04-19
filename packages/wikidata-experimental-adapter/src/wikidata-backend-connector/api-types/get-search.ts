import { WdClassHierarchyDescOnly } from '../../wikidata-entities/wd-class'

export interface WdGetSearchResponseResults {
  readonly classes: WdClassHierarchyDescOnly[];
}

export interface WdGetSearchResponse {
  readonly results: WdGetSearchResponseResults;
}

export class WdSearchResults {
  readonly classes: WdClassHierarchyDescOnly[];

  constructor(response: WdGetSearchResponse) {
    this.classes = response.results.classes; 
  }
}