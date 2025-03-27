import { CoreResource, CoreResourceReader } from "@dataspecer/core/core";
import { DataSpecification as CoreDataSpecification } from "@dataspecer/core/data-specification/model";
import { Generator } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";
import { getArtefactGenerators } from "../../artefact-generators";
import { getDefaultConfigurators } from "../../configurators";
import { DataSpecification } from "@dataspecer/backend-utils/connectors/specification";
import { ArtifactConfigurator } from "../artifact-configurator";
import { GenerateReport } from "./generate-report";
import { ZipStreamDictionary } from "./zip-stream-dictionary";
import { generateSpecification } from "@dataspecer/specification";
import { FrontendModelRepository } from "../utils/model-repository";
import { backendPackageService } from "../../editor/configuration/provided-configuration";

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
    private readonly dataSpecifications: Record<string, DataSpecification & {artefacts: any}>;
    private dataSpecificationIris: string[] = [];
    private reportCallback: ((report: GenerateReport) => void) | undefined;
    private artifactReport: GenerateReport = [];
    private configuration: object;

    public constructor(store: CoreResourceReader, dataSpecifications: Record<string, DataSpecification>, configuration: object) {
        this.store = store;
        // @ts-ignore
        this.dataSpecifications = dataSpecifications;
        this.configuration = configuration;
    }

    public async prepare(
      dataSpecificationIris: string[],
      reportCallback: ((report: GenerateReport) => void) | undefined = undefined,
    ) {
        this.dataSpecificationIris = dataSpecificationIris;
        this.reportCallback = reportCallback;

        // Generate artifacts
        const artifactConfigurator = new ArtifactConfigurator(
            Object.values(this.dataSpecifications),
            this.store as FederatedObservableStore,
            this.configuration,
            getDefaultConfigurators(),
        );

        for (const dataSpecificationIri of dataSpecificationIris) {
            this.dataSpecifications[dataSpecificationIri].artefacts =
              await artifactConfigurator.generateFor(dataSpecificationIri);
        }

        this.artifactReport = dataSpecificationIris
          .flatMap(dataSpecificationIri => this.dataSpecifications[dataSpecificationIri].artefacts.filter(a => a.outputPath).map(artifact => ({
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

        return zip.save();
    }

    private async writeReadme(writer: ZipStreamDictionary) {
        const stream = writer.writePath("README.md");
        await stream.write(`Tento dokument byl vygenerován ${new Date().toLocaleString("cs-CZ")}.`);
        await stream.close();
    }

    private async writeArtifacts(
      zip: ZipStreamDictionary,
    ) {
        // Convert data specification
        const dataSpecifications = Object.values(this.dataSpecifications).map(specification => ({
            ...specification,
            iri: specification.id,
            pim: specification.id,
            psms: specification.dataStructures.map(ds => ds.id),
            type: CoreDataSpecification.TYPE_DOCUMENTATION,
            importsDataSpecifications: specification.importsDataSpecificationIds,
            artefacts: specification.artefacts,
            // @ts-ignore
            artefactConfiguration: specification.artefactConfiguration,
            cimAdapters: [],
        })) as CoreDataSpecification[];

        const generator = new Generator(
            dataSpecifications,
            this.store,
            getArtefactGenerators()
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

            // use new generator for the rest
            await generateSpecification(
                dataSpecificationIri,
                {
                    modelRepository: new FrontendModelRepository(backendPackageService),
                    output: zip,

                    v1Context: await generator.createContext(),
                    v1Specification: dataSpecifications.find(specification => specification.iri === dataSpecificationIri),

                    // @ts-ignore
                    artifacts: this.dataSpecifications[dataSpecificationIri].artefacts,
                },
                {
                    subdirectory: this.dataSpecifications[dataSpecificationIri].artefacts[0].outputPath.split("/")[0] + "/",
                }
            );
        }
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
