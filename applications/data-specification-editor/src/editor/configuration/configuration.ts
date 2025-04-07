import { DataSpecification } from '@dataspecer/backend-utils/connectors/specification';
import { SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { OperationContext } from "../operations/context/operation-context";
import { SemanticModelAggregator } from '@dataspecer/core-v2/hierarchical-semantic-aggregator';

/**
 * Editor's configuration (or context) that specifies how the editor should work.
 * It contains source and target semantic models, data specifications, and other properties.
 */
export interface Configuration {
    store: FederatedObservableStore,
    dataSpecifications: { [iri: string]: DataSpecification };
    dataSpecificationIri: string|null;
    dataPsmSchemaIri: string|null;
    operationContext: OperationContext,

    /**
     * todo experimental
     */
    semanticModelAggregator: SemanticModelAggregator;
}

/**
 * These are the functions that are needed by the source semantic model in order to work properly.
 */
export interface SourceSemanticModelInterface {
    search(searchQuery: string): Promise<SemanticModelClass[]>;
    searchSync?: (searchQuery: string) => SemanticModelClass[];
    getSurroundings(iri: string): Promise<SemanticModelEntity[]>;
    getSurroundingsSync?: (iri: string) => SemanticModelEntity[];
    getFullHierarchy(iri: string): Promise<SemanticModelEntity[]>;
    getFullHierarchySync?: (iri: string) => SemanticModelEntity[];
}

export interface SearchableSemanticModelSync {
    searchEntitySync(searchQuery: string): SemanticModelClass[];
}

export function isSourceSemanticModelSearchableSync(model: any): model is SearchableSemanticModelSync {
    return model && (model as SearchableSemanticModelSync).searchEntitySync !== undefined;
}

export type ModelCompositionConfiguration = string | {
    modelType: "merge" | "application-profile" | "cache" | "legacy";
};

export type ModelCompositionConfigurationMerge = ModelCompositionConfiguration & {
    modelType: "merge";
    models: {
        model: ModelCompositionConfiguration,
    }[];
}

export type ModelCompositionConfigurationApplicationProfile = ModelCompositionConfiguration & {
    modelType: "application-profile";
    model: ModelCompositionConfiguration;
    profiles: ModelCompositionConfiguration;
    canAddEntities: boolean;
    canModify: boolean;
}

export type ModelCompositionConfigurationCache = ModelCompositionConfiguration & {
    modelType: "cache";
    model: ModelCompositionConfiguration;
    caches: ModelCompositionConfiguration;
}

export type ModelCompositionConfigurationLegacy = ModelCompositionConfiguration & {
    modelType: "legacy";
    configuration: string[];
}