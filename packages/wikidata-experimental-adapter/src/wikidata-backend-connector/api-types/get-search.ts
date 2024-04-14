import { WdClassDescOnly } from '../../wikidata-entities/wd-class'

export interface GetSearchResponseResults {
  readonly classes: WdClassDescOnly[];
}

export interface GetSearchResponse {
  readonly results: GetSearchResponseResults;
}

export class SearchResults {
  readonly classes: WdClassDescOnly[];

  constructor(response: GetSearchResponse) {
    this.classes = response.results.classes; 
  }
}