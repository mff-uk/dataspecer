import { WdEntityDescOnly, WdEntityIdsList } from "../../wikidata-entities/wd-entity";

// Property identifiers

export type WdPropertySearchCandidateSelectorsIds = 'elastic_bm25' | 'qdrant_sparse' | 'qdrant_dense';
export type WdPropertySearchFusionCandidateSelectorsIds = 'fusion';
export type WdPropertySearchRerankersIds = 'cross_encoder' | 'feature_usage_mappings';

// Class identifiers

export type WdClassSearchCandidateSelectorsIds =
  | 'elastic_bm25'
  | 'elastic_bm25_fielded'
  | 'qdrant_sparse'
  | 'qdrant_dense';
export type WdClassSearchFusionCandidateSelectorsIds = 'fusion';
export type WdClassSearchRerankersIds = 'cross_encoder' | 'feature_instance_mappings';

// Query

export interface WdSearchQuery {
    text: string;
}
export interface WdClassSearchQuery extends WdSearchQuery {
    properties: WdEntityIdsList;
}
export interface WdPropertySearchQuery extends WdSearchQuery {}
  
// Configurations

export interface WdSearchQueryConfig<T> {
    id: T;
    maxResults: number;
}
  
export interface WdSearchCandidateSelectorConfig<T> extends WdSearchQueryConfig<T> {}

export interface WdSearchFusionCandidateSelectorConfig<FT, CT> extends WdSearchQueryConfig<FT> {
    fusionWeights: number[];
    candidateSelectors: Array<WdSearchCandidateSelectorConfig<CT>>;
}
  
export interface WdSearchRerankerConfig<T> extends WdSearchQueryConfig<T> {
    queryWeight?: number | undefined;
    featureWeights?: number[] | undefined;
}
  
export interface WdSearchConfig<CT, FT, RT, Q extends WdSearchQuery> {
    query: Q;
    candidateSelectorConfig?: WdSearchCandidateSelectorConfig<CT> | undefined;
    fusionCandidateSelectorConfig?: WdSearchFusionCandidateSelectorConfig<FT, CT> | undefined;
    rerankerConfig?: Array<WdSearchRerankerConfig<RT>> | undefined;
}

export interface WdSearchClassesConfig extends WdSearchConfig<
    WdClassSearchCandidateSelectorsIds,
    WdClassSearchFusionCandidateSelectorsIds,
    WdClassSearchRerankersIds,
    WdClassSearchQuery
> {}

export interface WdSearchPropertiesConfig extends WdSearchConfig<
    WdPropertySearchCandidateSelectorsIds,
    WdPropertySearchFusionCandidateSelectorsIds,
    WdPropertySearchRerankersIds,
    WdPropertySearchQuery
> {}


export interface WdPostSearchResponse<T extends WdEntityDescOnly>  {
    readonly results: T[];
}

export class WdPostSearchResults<T extends WdEntityDescOnly> {
    readonly results: T[];

    constructor(response: WdPostSearchResponse<T>) {
        this.results = response.results;
    }
}
