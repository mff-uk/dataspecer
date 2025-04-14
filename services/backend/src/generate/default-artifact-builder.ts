import {CoreResource, CoreResourceReader} from "@dataspecer/core/core";
import {Generator} from "@dataspecer/core/generator";
import {ZipStreamDictionary} from "./zip-stream-dictionary.ts";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {ArtifactConfigurator} from "./artifact-configurator.ts";
import {getArtefactGenerators} from "./artefact-generators.ts";
import {getDefaultConfigurators} from "./configurators.ts";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { DataSpecificationWithMetadata, DataSpecificationWithStores } from "@dataspecer/backend-utils/interfaces";

type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

interface DataSpecifications {
    [key: string]: FullDataSpecification;
}

async function writeToStreamDictionary(
  streamDictionary: StreamDictionary,
  path: string,
  data: string,
  ) {
    const stream = streamDictionary.writePath(path);
    await stream.write(data);
    await stream.close();
}

/**
 * Class handling a construction of the zip file. Configuration, helper files, etc.
 */
export class DefaultArtifactBuilder {
    private readonly store: CoreResourceReader;
    private readonly dataSpecifications: DataSpecifications;
    private dataSpecificationIris: string[] = [];
    private configuration: object;

    public constructor(store: CoreResourceReader, dataSpecifications: DataSpecifications, configuration: object) {
        this.store = store;
        this.dataSpecifications = dataSpecifications;
        this.configuration = configuration;
    }

    public async prepare(
      dataSpecificationIris: string[],
    ) {
        this.dataSpecificationIris = dataSpecificationIris;

        // Generate artifacts
        const artifactConfigurator = new ArtifactConfigurator(
            Object.values(this.dataSpecifications),
            this.store,
            this.configuration,
            getDefaultConfigurators(),
        );

        for (const dataSpecificationIri of dataSpecificationIris) {
            this.dataSpecifications[dataSpecificationIri].artefacts =
              await artifactConfigurator.generateFor(dataSpecificationIri);
        }
    }

    /**
     * Builds the given data specifications and adds additional files to the
     * final zip. The build process is split into individual artifacts in a way
     * that if one fails, other can still be generated.
     */
    public async build(): Promise<Buffer> {
        const zip = new ZipStreamDictionary();

        await this.writeReadme(zip);
        await this.writeArtifacts(zip);
        await this.writeStore(zip);

        return zip.save();
    }

    private async writeReadme(writer: ZipStreamDictionary) {
        const stream = await writer.writePath("README.md");
        await stream.write(`Tento dokument byl vygenerován ${new Date().toLocaleString("cs-CZ")}.`);
        await stream.close();
    }

    private async writeArtifacts(
      zip: ZipStreamDictionary,
    ) {
        await writeToStreamDictionary(
          zip,
          "resources/data_specifications.json",
          JSON.stringify(this.dataSpecifications, null, 4),
        );

        const generator = new Generator(
            Object.values(this.dataSpecifications),
            this.store,
            getArtefactGenerators()
        );

        for (const dataSpecificationIri of this.dataSpecificationIris) {
            for (const artifact of this.dataSpecifications[dataSpecificationIri].artefacts) {
                try {
                    await generator.generateArtefact(dataSpecificationIri, artifact.iri as string, zip);
                } catch (error) {
                    console.warn(`Failed to generate artifact ${artifact.iri} (with output path ${artifact.outputPath}) for specification ${dataSpecificationIri}. The error message follows.`);
                    console.error(error);

                    const stream = zip.writePath(artifact.outputPath + ".error.txt");
                    await stream.write((error as Error)?.message + "\n\n" + (error as Error)?.stack);
                    await stream.close();
                }
            }
        }
    }

    private async writeStore(streamDictionary: StreamDictionary) {
        const resources = await this.store.listResources();
        const rawStore: {
            [iri: string]: CoreResource | null;
        } = {};
        for (const iri of resources) {
            rawStore[iri] = await this.store.readResource(iri);
        }

        await writeToStreamDictionary(
          streamDictionary,
          "resources/merged_store.json",
          JSON.stringify(rawStore, null, 4),
        );
    }
}
