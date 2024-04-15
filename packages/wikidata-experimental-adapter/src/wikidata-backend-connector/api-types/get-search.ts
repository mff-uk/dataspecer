import { WdClassHierarchyDescOnly } from '../../wikidata-entities/wd-class'

export interface GetSearchResponseResults {
  readonly classes: WdClassHierarchyDescOnly[];
}

export interface GetSearchResponse {
  readonly results: GetSearchResponseResults;
}

export class SearchResults {
  readonly classes: WdClassHierarchyDescOnly[];

  constructor(response: GetSearchResponse) {
    this.classes = response.results.classes; 
  }
}