import { WdClassDescOnly } from '../../wikidata-entities/wd-class'

export interface SearchResults {
  readonly classes: WdClassDescOnly[];
}

export interface GetSearchResponse {
  readonly results: SearchResults;
}