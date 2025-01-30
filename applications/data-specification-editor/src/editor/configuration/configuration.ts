import { DataSpecification } from '@dataspecer/backend-utils/connectors/specification';
import { SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { OperationContext } from "../operations/context/operation-context";

/**
 * Editor's configuration (or context) that specifies how the editor should work.
 * It contains source and target semantic models, data specifications, and other properties.
 */
export interface Configuration {
    store: FederatedObservableStore,
    dataSpecifications: { [iri: string]: DataSpecification };
    dataSpecificationIri: string|null;
    dataPsmSchemaIri: string|null;
    /**
     * The semantic model that is used to search for new entities from the semantic layer that will be added to the structure layer.
     *
     * It is also used to provide context for lookup. It may be same as the targetSemanticWriter.
     *
     * The model is only one as aggregation can be used. If the model is not set (null), it means that there is no semantic
     * layer available. This should disable searching for *interpreted* root and also adding *interpreted* entities from surrounding.
     * It should still make possible to add non-interpreted entities.
     */
    sourceSemanticModel: SourceSemanticModelInterface;
    operationContext: OperationContext,
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
