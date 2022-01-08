import {Configuration} from "../shared/configuration";
import {ArchiveWriter, ZipWriter} from "./archive-writer";
import {MemoryOutputStream} from "@model-driven-data/core//io/stream/memory-output-stream";
import {webSpecificationToBikeshed, writeBikeshed} from "@model-driven-data/core//bikeshed";
import {createModelsToWebSpecificationConfiguration, modelsToWebSpecification} from "@model-driven-data/core//documentation-model";
import {coreResourcesToConceptualModel} from "@model-driven-data/core//conceptual-model";
import {coreResourcesToStructuralModel, StructureModel} from "@model-driven-data/core//structure-model";
import {CoreResource, CoreResourceReader, CoreResourceWriter} from "@model-driven-data/core//core";
import {FederatedObservableStore} from "../shared/store/federated-observable-store";
import {SyncMemoryStore} from "../shared/store/core-stores/sync-memory-store";
import {SyncMemoryStoreConfigurationStoreBuilder} from "../shared/store/core-stores/sync-memory-store-configuration-store";
import {SCHEMA as PIM_SCHEMA} from "@model-driven-data/core//pim/pim-vocabulary";
import {StoreByPropertyDescriptor} from "../shared/store/operation-executor";
import {SCHEMA as DATA_PSM_SCHEMA} from "@model-driven-data/core//data-psm/data-psm-vocabulary";
import {structureModelToJsonSchema} from "@model-driven-data/core//json-schema/json-schema-model-adapter";
import {writeJsonSchema} from "@model-driven-data/core//json-schema/json-schema-writer";
import {objectModelToXmlSchema, writeXmlSchema} from "@model-driven-data/core//xml-schema";
import {BikeshedGenerator} from "./bikeshed-generator";


export class ArtifactBuilder {
    private configuration: Configuration;
    private store: FederatedObservableStore | null = null;

    public constructor(data: Configuration) {
        this.configuration = data;
    }

    public async build(): Promise<Blob> {
        const zip = new ZipWriter();
        const writer = zip.getRoot();
        await this.constructStore();
        if (!this.store) {
            throw new Error("Store is not initialized.");
        }

        this.writeReadme(writer);
        await this.writeBikeshedDocumentation(writer);

        const schemasDirectory = writer.directory('schemas');

        for (const store of this.store.getStores()) {
            if (!store.metadata.tags.includes('root') || !store.metadata.tags.includes('data-psm')) {
                continue;
            }

            const psmSchemaIri = (await store.store.listResourcesOfType(DATA_PSM_SCHEMA))[0];
            if (!psmSchemaIri) {
                continue;
            }

            const dir = schemasDirectory.directory(psmSchemaIri.split('/').pop() as string);

            if (store.metadata.artifacts?.includes("json")) {
                await this.writeJsonSchema(dir, psmSchemaIri);
            }

            if (store.metadata.artifacts?.includes("xml")) {
                await this.writeXmlSchema(dir, psmSchemaIri);
            }
        }

        const resourcesDirectory = writer.directory('resources');
        await this.writeStore(resourcesDirectory);

        return zip.write();
    }

    private async constructStore() {
        const store = this.store = new FederatedObservableStore();

        const syncMemoryStores: SyncMemoryStore[] = []
        this.configuration.stores.forEach(s => {
            let coreStore: CoreResourceReader & CoreResourceWriter | null = null;
            if (SyncMemoryStoreConfigurationStoreBuilder.accepts(s.store)) {
                const builder = new SyncMemoryStoreConfigurationStoreBuilder(s.store);
                const syncMemoryStore = builder.build();
                syncMemoryStores.push(syncMemoryStore);
                coreStore = syncMemoryStore;
            }

            if (coreStore) {
                store.addStore({
                    store: coreStore,
                    metadata: s.metadata,
                })
            }
        });

        await Promise.all(syncMemoryStores.map(s => s.loadStore()));
    }

    private async writeReadme(writer: ArchiveWriter) {
        await writer.file("README.md", `Tento dokument byl vygenerován ${new Date().toLocaleString("cs-CZ")}.`);
    }

    private async writeBikeshedDocumentation(writer: ArchiveWriter) {
        if (!this.store) {
            throw new Error("Store is not initialized.");
        }
        const store = this.store;

        try {
            const pimSchemaIri = (await this.store.listResourcesOfType(PIM_SCHEMA, new StoreByPropertyDescriptor(['root', 'pim'])))[0];
            const dataPsmIris = await this.store.listResourcesOfType(DATA_PSM_SCHEMA, new StoreByPropertyDescriptor(['root', 'data-psm']));

            const conceptualModel = await coreResourcesToConceptualModel(store, pimSchemaIri);
            const structureModels = await Promise.all(dataPsmIris.map(iri => coreResourcesToStructuralModel(store, iri)));
            const modelsToWebSpecificationConfiguration = createModelsToWebSpecificationConfiguration();

            if (conceptualModel === null) {
                throw new Error("Empty conceptual model.");
            }

            const webSpecification = modelsToWebSpecification(conceptualModel, structureModels.filter((a => a !== null) as ((a: any) => a is StructureModel)), modelsToWebSpecificationConfiguration);

            const bikeshed = webSpecificationToBikeshed(webSpecification);
            const stream = new MemoryOutputStream();
            await writeBikeshed(bikeshed, stream);

            await writer.file("documentation.bs", stream.getContent());

            const generatedBikeshed = await (new BikeshedGenerator()).generate(stream.getContent());
            if (generatedBikeshed) {
                await writer.file("documentation.html", generatedBikeshed);
            }
        } catch (error) {
            await writer.file("documentation.bs.error", (error as Error).message);
        }
    }

    private async writeJsonSchema(writer: ArchiveWriter, psmSchemaIri: string) {
        if (!this.store) {
            throw new Error("Store is not initialized.");
        }

        try {
            const structureModel = await coreResourcesToStructuralModel(this.store, psmSchemaIri);
            if (structureModel === null) {
                throw new Error("Empty structural model.");
            }

            const jsonSchema = structureModelToJsonSchema(structureModel);
            const stream = new MemoryOutputStream();
            await writeJsonSchema(jsonSchema, stream);

            await writer.file("schema.json", stream.getContent());
        } catch (error) {
            await writer.file("schema.json.error", (error as Error).message);
        }
    }

    private async writeXmlSchema(writer: ArchiveWriter, psmSchemaIri: string) {
        if (!this.store) {
            throw new Error("Store is not initialized.");
        }

        try {
            const structureModel = await coreResourcesToStructuralModel(this.store, psmSchemaIri);
            if (structureModel === null) {
                throw new Error("Empty structural model.");
            }

            const schema = objectModelToXmlSchema(structureModel);
            const stream = new MemoryOutputStream();
            await writeXmlSchema(schema, stream);

            await writer.file("schema.xsd", stream.getContent());
        } catch (error) {
            await writer.file("schema.xsd.error", (error as Error).message);
        }
    }

    private async writeStore(writer: ArchiveWriter) {
        if (!this.store) {
            throw new Error("Store is not initialized.");
        }

        const resources = await this.store.listResources();
        const rawStore: {
            [iri: string]: CoreResource | null;
        } = {};
        for (const iri of resources) {
            rawStore[iri] = await this.store.readResource(iri);
        }

        await writer.file("merged_store.json", JSON.stringify(rawStore, null, 4));
        await writer.file("configuration.json", JSON.stringify(this.configuration, null, 4));

        const pimSchemaIri = (await this.store.listResourcesOfType(PIM_SCHEMA, new StoreByPropertyDescriptor(['root', 'pim'])))[0];
        const conceptualModel = await coreResourcesToConceptualModel(this.store, pimSchemaIri);

        await writer.file("conceptual_model.json", JSON.stringify(conceptualModel, null, 4));

    }
}
