import { EntityModel } from '@dataspecer/core-v2';
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModelClass, SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship } from '@dataspecer/core-v2/semantic-model/concepts';
import { wrapCimAdapter } from '@dataspecer/core-v2/semantic-model/simplified';
import { PrefixIriProvider } from "@dataspecer/core/cim";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { RdfsFileAdapter } from "@dataspecer/rdfs-adapter";
import { SgovAdapter } from "@dataspecer/sgov-adapter";
import { WikidataAdapter } from "@dataspecer/wikidata-experimental-adapter";
import { DataSpecification, StructureEditorBackendService } from '@dataspecer/backend-utils/connectors/specification';
import { useAsyncMemo } from '../hooks/use-async-memo';
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
                if (isSemanticModelClass(entity)) {
                    for (const name of Object.values(entity.name)) {
                        if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
                            filteredEntities.push(entity);
                        }
                    }
                }
            }
        }

        return filteredEntities;
    }

    /**
     * Returns surroudings of the entity with the given IRI.
     */
    async getSurroundings(): Promise<SemanticModelEntity[]> {
        let result = {};
        for (const model of this.models) {
            result = {...result, ...model.getEntities()};
        }
        return this.changeIdsOfEntitiesToIris(Object.values(result));
    }

    async getFullHierarchy(): Promise<SemanticModelEntity[]> {
        let result = {};
        for (const model of this.models) {
            result = {...result, ...model.getEntities()};
        }
        return this.changeIdsOfEntitiesToIris(Object.values(result));
    }

    /**
     * This is a trick to replace ids with iris so you can use local model as a source semantic model.
     */
    private changeIdsOfEntitiesToIris(entities: SemanticModelEntity[]): SemanticModelEntity[] {
        // Gather dictionary

        const dictionary = {};
        for (const entity of entities) {
            if (isSemanticModelClass(entity) && entity.iri) {
                dictionary[entity.id] = entity.iri;
            }
            if (isSemanticModelRelationship(entity) && entity.ends[1]?.iri) {
                dictionary[entity.id] = entity.ends[1]?.iri;
            }
        }

        // Translate everything

        const translation: SemanticModelEntity[] = [];
        for (const entity of entities) {
            if (isSemanticModelClass(entity)) {
                translation.push({...entity, id: dictionary[entity.id] ?? entity.id});
            }
            if (isSemanticModelRelationship(entity)) {
                translation.push({
                    ...entity,
                    id: dictionary[entity.id] ?? entity.id,
                    ends: entity.ends.map(end => ({...end, concept: dictionary[end.concept] ?? end.concept}))
                } as SemanticModelRelationship);
            }
            if (isSemanticModelGeneralization(entity)) {
                translation.push({
                    ...entity,
                    child: dictionary[entity.child] ?? entity.child,
                    parent: dictionary[entity.parent] ?? entity.parent
                } as SemanticModelGeneralization);
            }
        }

        return translation;
    }
}

/**
 * Service to query backend under new v2 version.
 */
const service = new StructureEditorBackendService(import.meta.env.VITE_BACKEND, httpFetch, "http://dataspecer.com/packages/local-root");

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
        const {cimAdapter: adapter} = await getAdapter(cimAdaptersConfiguration, service);
        return adapter;
    }, [cimAdaptersConfiguration]);

    return sourceSemanticModel ?? null;
};

export const getAdapter = async (urls: string[], service: StructureEditorBackendService) => {
    const iriProvider = new PrefixIriProvider();

    if (urls.length === 0 || (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/sgov")) {
        const cimAdapter = new SgovAdapter("https://slovník.gov.cz/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter: wrapCimAdapter(cimAdapter)};
    }

    if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/wikidata") {
        const cimAdapter = new WikidataAdapter(httpFetch, import.meta.env.VITE_WIKIDATA_ONTOLOGY_BACKEND);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter: wrapCimAdapter(cimAdapter)};
    }

    if (urls.length === 1 && urls[0] === "https://dataspecer.com/adapters/sgov-en") {
        const cimAdapter = new SgovAdapter("https://er2023.dataspecer.com/sparql", httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter: wrapCimAdapter(cimAdapter)};
    }

    if (urls.every(url => url.startsWith("rdfs:"))) {
        const cimAdapter = new RdfsFileAdapter(urls, httpFetch);
        cimAdapter.setIriProvider(iriProvider);
        return {iriProvider, cimAdapter: wrapCimAdapter(cimAdapter)};
    }

    // todo construct ne semantic model
    return {iriProvider, cimAdapter: new SourceSemanticModel(await service.constructSemanticModelFromIds(urls))}
}