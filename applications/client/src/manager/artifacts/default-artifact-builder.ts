import {CoreResource, CoreResourceReader} from "@dataspecer/core/core";
import {createDefaultArtefactGenerators, Generator} from "@dataspecer/core/generator";
import {ZipStreamDictionary} from "./zip-stream-dictionary";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {PlantUmlImageGenerator} from "./plant-uml-image-generator";
import {BikeshedHtmlGenerator} from "./bikeshed-html-generator";
import {DataSpecifications} from "../data-specifications";
import {ArtifactConfigurator} from "../artifact-configurator";
import {GenerateReport} from "./generate-report";

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
    private reportCallback: ((report: GenerateReport) => void) | undefined;
    private artifactReport: GenerateReport = [];

    public constructor(store: CoreResourceReader, dataSpecifications: DataSpecifications) {
        this.store = store;
        this.dataSpecifications = dataSpecifications;
    }

    public async prepare(
      dataSpecificationIris: string[],
      reportCallback: ((report: GenerateReport) => void) | undefined = undefined,
    ) {
        this.dataSpecificationIris = dataSpecificationIris;
        this.reportCallback = reportCallback;

        // Generate artifacts
        const artifactConfigurator = new ArtifactConfigurator(
          Object.values(this.dataSpecifications), this.store);

        for (const dataSpecificationIri of dataSpecificationIris) {
            this.dataSpecifications[dataSpecificationIri].artefacts =
              await artifactConfigurator.generateFor(dataSpecificationIri);
        }

        this.artifactReport = dataSpecificationIris
          .flatMap(dataSpecificationIri => this.dataSpecifications[dataSpecificationIri].artefacts.map(artifact => ({
              artifact: artifact,
              state: "pending",
              error: null,
          })));
        reportCallback?.(this.artifactReport);
    }

    /**
     * Builds the given data specifications and adds additional files to the
     * final zip. The build process is split into individual artifacts in a way
     * that if one fails, other can still be generated.
     */
    public async build(): Promise<Blob> {
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
            [
                ...createDefaultArtefactGenerators(),
                new PlantUmlImageGenerator(),
                new BikeshedHtmlGenerator(),
            ]
        );

        for (const dataSpecificationIri of this.dataSpecificationIris) {
            for (const artifact of this.dataSpecifications[dataSpecificationIri].artefacts) {
                try {
                    this.updateState(artifact.iri as string, "progress", null);
                    await generator.generateArtefact(dataSpecificationIri, artifact.iri as string, zip);
                    this.updateState(artifact.iri as string, "success", null);
                } catch (error) {
                    console.warn(`Failed to generate artifact ${artifact.iri} (with output path ${artifact.outputPath}) for specification ${dataSpecificationIri}. The error message follows.`);
                    console.error(error);
                    this.updateState(artifact.iri as string, "error", error as Error);

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

    private updateState(artifactIri: string, state: GenerateReport[0]["state"], error: GenerateReport[0]["error"]) {
        this.artifactReport = this.artifactReport.map(artifact => {
            if (artifact.artifact.iri === artifactIri) {
                return {
                    ...artifact,
                    state,
                    error,
                };
            }
            return artifact;
        });
        this.reportCallback?.(this.artifactReport);
    }
}
