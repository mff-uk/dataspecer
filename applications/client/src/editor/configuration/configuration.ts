import { EntityModel } from '@dataspecer/core-v2';
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { isSemanticModelClass, SemanticModelClass, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { wrapCimAdapter } from '@dataspecer/core-v2/semantic-model/simplified';
import { DataSpecification } from "@dataspecer/core/data-specification/model";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { useAsyncMemo } from '../hooks/use-async-memo';
import { OperationContext } from "../operations/context/operation-context";
import { getAdapter } from './adapters/get-adapter';


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

/**
 * Temporary implementation of the source semantic model.
 */
class SourceSemanticModel implements SourceSemanticModelInterface {
    private readonly models: EntityModel[];

    constructor(models: EntityModel[]) {
        this.models = models;
    }

    async search(searchQuery: string): Promise<SemanticModelClass[]> {
        const filteredEntities = [];
        for (const model of this.models) {
            const entities = model.getEntities();
            for (const entity of Object.values(entities)) {
                if (isSemanticModelClass(entity) && entity.name.en.toLowerCase().includes(searchQuery.toLowerCase())) {
                    filteredEntities.push(entity);
                }
            }
        }

        return filteredEntities;
    }

    /**
     * Returns surroudings of the entity with the given IRI.
     */
    async getSurroundings(iri: string): Promise<SemanticModelEntity[]> {
        let result = {};
        for (const model of this.models) {
            result = {...result, ...model.getEntities()};
        }
        return Object.values(result);
    }

    async getFullHierarchy(iri: string): Promise<SemanticModelEntity[]> {
        let result = {};
        for (const model of this.models) {
            result = {...result, ...model.getEntities()};
        }
        return Object.values(result);
    }
}

/**
 * Service to query backend under new v2 version.
 */
const service = new BackendPackageService(process.env.REACT_APP_BACKEND, httpFetch);

const DEFAULT_CONFIG = [];

/**
 * This hooks returns the configuration under the application should work.
 * 
 * null means that the configuration is not yet loaded
 */
export function useProvidedSourceSemanticModel(
    modelIri: string | null,
    packageIri: string | null,
    cimAdaptersConfiguration: any[] = DEFAULT_CONFIG,
): SourceSemanticModelInterface | null {
    const [sourceSemanticModel] = useAsyncMemo(async () => {
        if (packageIri) {
            const [models] = await service.constructSemanticModelPackageModels(packageIri);
            /**
             * Todo: remove support for old Dataspecer
             * If there is at least one semantic model, use it instead of the old one.
             */
            if (models.length === 0) {
                const {cimAdapter: adapter} = getAdapter(cimAdaptersConfiguration);
                return wrapCimAdapter(adapter);
            } else {
                const sourceSemanticModel = new SourceSemanticModel(models);
                return sourceSemanticModel;
            }
        } else {
            const {cimAdapter: adapter} = getAdapter(cimAdaptersConfiguration);
            return wrapCimAdapter(adapter);
        }
    }, [packageIri, cimAdaptersConfiguration]);

    return sourceSemanticModel ?? null;
};