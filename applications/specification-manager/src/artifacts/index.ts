import {Configuration} from "../shared/configuration";
import {FederatedObservableStore} from "../shared/store/federated-observable-store";
import {SyncMemoryStore} from "../shared/store/core-stores/sync-memory-store";
import {CoreResource, CoreResourceReader, CoreResourceWriter} from "@model-driven-data/core/core";
import {SyncMemoryStoreConfigurationStoreBuilder} from "../shared/store/core-stores/sync-memory-store-configuration-store";
import {Generator} from "@model-driven-data/core/generator";
import {DataSpecification} from "@model-driven-data/core/data-specification/model";
import {ZipStreamDictionary} from "./zip-stream-dictionary";
import {PlantUmlGenerator} from "@model-driven-data/core/plant-uml";
import {BikeshedGenerator} from "@model-driven-data/core/bikeshed";
import {StreamDictionary} from "@model-driven-data/core/io/stream/stream-dictionary";
import {JsonSchemaGenerator} from "@model-driven-data/core/json-schema/json-schema-generator";
import {XmlSchemaGenerator} from "@model-driven-data/core/xml-schema";
import {PlantUmlImageGenerator} from "./plant-uml-image-generator";
import {BikeshedHtmlGenerator} from "./bikeshed-html-generator";
import {getDataSpecificationsFromStore} from "../shared/emulate-data-specification";
import {ArtifactDefinitionConfigurator} from "../shared/artifact-definition-configurator";
import {GeneratorOptions} from "../shared/generator-options";

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

        // todo: This temporary hack fixes problem with different interfaces
        // between backend and frontend.
        const [
          dataSpecifications,
          generatorOptions,
          rootSpecification
        ] = await getDataSpecificationsFromStore(store);

        await this.writeReadme(zip);
        await this.writeArtifacts(
          zip,
          store,
          dataSpecifications,
          generatorOptions,
          rootSpecification,
        );
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

    private async writeArtifacts(
      zip: ZipStreamDictionary,
      store: FederatedObservableStore,
      dataSpecifications: DataSpecification[],
      generatorOptions: Record<string, GeneratorOptions>,
      rootDataSpecificationIri: string,
    ) {
        const configurator = new ArtifactDefinitionConfigurator(
          dataSpecifications,
          store,
        );

        for (const dataSpecification of dataSpecifications) {
            await configurator.setConfigurationForSpecification(
              dataSpecification.iri as string,
              generatorOptions[dataSpecification.iri as string],
            );
        }

        await writeToStreamDictionary(
          zip,
          "resources/data_specifications.json",
          JSON.stringify(dataSpecifications, null, 4),
        );

        const generator = new Generator(
          dataSpecifications,
          store,
          [
            new JsonSchemaGenerator(),
            new XmlSchemaGenerator(),
            new BikeshedGenerator(),
            new PlantUmlGenerator(),

            new PlantUmlImageGenerator(),
            new BikeshedHtmlGenerator(),
          ]
        );

        for (const dataSpecification of dataSpecifications) {
            try {
                await generator.generate(dataSpecification.iri as string, zip);
            } catch (e) {
                console.warn(`Failed to generate artifacts for specification: ${dataSpecification.iri}. The generate() method thrown. The result may be incomplete. See the error below.`);
                console.error(e);
            }
        }
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
    }
}
