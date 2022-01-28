import {Configuration} from "../shared/configuration";
import {FederatedObservableStore} from "../shared/store/federated-observable-store";
import {SyncMemoryStore} from "../shared/store/core-stores/sync-memory-store";
import {CoreResource, CoreResourceReader, CoreResourceWriter} from "@model-driven-data/core/core";
import {SyncMemoryStoreConfigurationStoreBuilder} from "../shared/store/core-stores/sync-memory-store-configuration-store";
import {Generator} from "@model-driven-data/core/generator";
import {DataSpecification, DataSpecificationArtefact, DataSpecificationDocumentation, DataSpecificationSchema} from "@model-driven-data/core/data-specification/model";
import {ZipStreamDictionary} from "./zip-stream-dictionary";
import * as PSM from "@model-driven-data/core/data-psm/data-psm-vocabulary";
import * as PIM from "@model-driven-data/core/pim/pim-vocabulary";
import {PlantUmlGenerator} from "@model-driven-data/core/plant-uml";
import {StoreByPropertyDescriptor} from "../shared/store/operation-executor";
import {BIKESHED, BikeshedGenerator} from "@model-driven-data/core/bikeshed";
import {StreamDictionary} from "@model-driven-data/core/io/stream/stream-dictionary";
import {coreResourcesToConceptualModel} from "@model-driven-data/core/conceptual-model";
import {JsonSchemaGenerator} from "@model-driven-data/core/json-schema/json-schema-generator";
import {PlantUmlImageGenerator} from "./plant-uml-image-generator";
import {BikeshedHtmlGenerator} from "./bikeshed-html-generator";

async function writeToStreamDictionary(
  streamDictionary: StreamDictionary,
  path: string,
  data: string,
  ) {
    const stream = streamDictionary.writePath(path);
    await stream.write(data);
    await stream.close();
}

export class ArtifactBuilder {
    private readonly configuration: Configuration;

    public constructor(data: Configuration) {
        this.configuration = data;
    }

    public async build(): Promise<Blob> {
        const zip = new ZipStreamDictionary();

        const store = await this.constructStore();

        await this.writeReadme(zip);
        await this.writeArtifacts(zip, store);
        await this.writeStore(zip, store);

        return zip.save();
    }

    private async writeReadme(writer: ZipStreamDictionary) {
        const stream = await writer.writePath("README.md");
        await stream.write(`Tento dokument byl vygenerován ${new Date().toLocaleString("cs-CZ")}.`);
        await stream.close();
    }

    private async constructStore(): Promise<FederatedObservableStore> {
        const store = new FederatedObservableStore();

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

        return store;
    }

    private async writeArtifacts(zip: ZipStreamDictionary, store: FederatedObservableStore) {
        // Currently, we are generating artifacts for only the root data
        // specification.

        const currentSchemaArtefacts: DataSpecificationArtefact[] = [];

        // JSON and XML schemas for all data structures.
        for (const singleStore of store.getStores()) {
            if (!singleStore.metadata.tags.includes('root') || !singleStore.metadata.tags.includes('data-psm')) {
                continue;
            }

            const psmSchemaIri = (await singleStore.store.listResourcesOfType(PSM.SCHEMA))[0];
            if (!psmSchemaIri) {
                continue;
            }

            const name = psmSchemaIri.split('/').pop() as string;

            if (singleStore.metadata.artifacts?.includes("json")) {
                const jsonSchema = new DataSpecificationSchema();
                jsonSchema.iri = `${name}#jsonschema`;
                jsonSchema.outputPath = `schemas/${name}/schema.json`;
                jsonSchema.publicUrl = jsonSchema.outputPath;
                jsonSchema.generator = "jsonschema";
                jsonSchema.psm = psmSchemaIri;

                currentSchemaArtefacts.push(jsonSchema);
            }

            if (singleStore.metadata.artifacts?.includes("xml")) {
                const xmlSchema = new DataSpecificationSchema();
                xmlSchema.iri = `${name}#xmlschema`;
                xmlSchema.outputPath = `schemas/${name}/schema.xsd`;
                xmlSchema.publicUrl = xmlSchema.outputPath;
                xmlSchema.generator = "xmlschema";
                xmlSchema.psm = psmSchemaIri;

                currentSchemaArtefacts.push(xmlSchema);
            }
        }

        // PlantUML source
        const plantUml = new DataSpecificationDocumentation();
        plantUml.outputPath = "conceptualModel.plantuml";
        plantUml.publicUrl = plantUml.outputPath;
        plantUml.generator = PlantUmlGenerator.IDENTIFIER;

        // PlantUml image
        const plantUmlImage = new DataSpecificationDocumentation();
        plantUmlImage.outputPath = "conceptualModel.png";
        plantUmlImage.publicUrl = plantUmlImage.outputPath;
        plantUmlImage.generator = PlantUmlImageGenerator.IDENTIFIER;

        // Bikeshed source
        const bikeshed = new DataSpecificationDocumentation();
        bikeshed.outputPath = "documentation.bs";
        bikeshed.publicUrl = bikeshed.outputPath;
        bikeshed.generator = BIKESHED.Generator;
        bikeshed.artefacts =
          currentSchemaArtefacts.map(artefact => artefact.iri as string);

        // Bikeshed HTML
        const bikeshedHtml = new DataSpecificationDocumentation();
        bikeshedHtml.outputPath = "documentation.html";
        bikeshedHtml.publicUrl = bikeshedHtml.outputPath;
        bikeshedHtml.generator = BikeshedHtmlGenerator.IDENTIFIER;
        bikeshedHtml.artefacts =
          currentSchemaArtefacts.map(artefact => artefact.iri as string);

        const schemas = await store.listResourcesOfType(PSM.SCHEMA,
          new StoreByPropertyDescriptor(["root", "data-psm"]));
        const pimSchemas = await store.listResourcesOfType(PIM.SCHEMA);

        const rootDataSpecification = new DataSpecification();
        rootDataSpecification.iri = "root";
        rootDataSpecification.pim = pimSchemas[0];
        rootDataSpecification.psms = schemas;
        rootDataSpecification.artefacts = [
            ...currentSchemaArtefacts,
            plantUml,
            plantUmlImage,
            bikeshed,
            bikeshedHtml,
        ];

        const generator = new Generator(
          [rootDataSpecification],
          store,
          [
            new JsonSchemaGenerator(),
            new BikeshedGenerator(),
            new PlantUmlGenerator(),

            new PlantUmlImageGenerator(),
            new BikeshedHtmlGenerator(),
          ]
        );

        await generator.generate("root", zip);
    }

    private async writeStore(streamDictionary: StreamDictionary, store: FederatedObservableStore) {
        const resources = await store.listResources();
        const rawStore: {
            [iri: string]: CoreResource | null;
        } = {};
        for (const iri of resources) {
            rawStore[iri] = await store.readResource(iri);
        }

        await writeToStreamDictionary(
          streamDictionary,
          "resources/merged_store.json",
          JSON.stringify(rawStore, null, 4),
        );
        await writeToStreamDictionary(
          streamDictionary,
          "resources/configuration.json",
          JSON.stringify(this.configuration, null, 4),
        );

        const pimSchemaIri = (await store.listResourcesOfType(PIM.SCHEMA, new StoreByPropertyDescriptor(['root', 'pim'])))[0];
        const conceptualModel = await coreResourcesToConceptualModel(store, pimSchemaIri);

        await writeToStreamDictionary(
          streamDictionary,
          "resources/conceptual_model.json",
          JSON.stringify(conceptualModel, null, 4),
        );
    }
}
