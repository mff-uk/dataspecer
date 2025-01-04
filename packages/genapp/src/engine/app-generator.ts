import * as fs from "fs";
import {
    CapabilityGenerator,
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability,
    EditInstanceCapability,
    LIST_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    EDIT_CAPABILITY_ID
} from "../capabilities";
import { ConfigurationReaderFactory } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "../react-base/react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";
import { ApplicationGraph, ApplicationGraphNode } from "./graph";
import { AggregateMetadata, AggregateMetadataCache } from "../application-config";
import { ArtifactCache } from "../utils/artifact-saver";
import { GenappEnvConfig, GenappEnvironmentConfig } from "./generator-env-config";
import { ZipArchiveGenerator } from "./zip-archive-generator";

export type NodeResult = {
    structure: AggregateMetadata;
    artifact: LayerArtifact;
    nodePath: string;
    capability: {
        label: string,
        type: string
    };
};

export interface GenappConfiguration extends GenappEnvironmentConfig {
    appGraphFile?: string;
    serializedGraph?: string;
}

/**
 * The `ApplicationGenerator` is main class responsible for application generation based on a given configuration - application graph.
 * It processes application graph nodes to generate the application prototype. The generated application is then packaged into a ZIP archive.
 */
export class ApplicationGenerator {
    private readonly _args: GenappConfiguration;

    constructor(args: GenappConfiguration) {
        this._args = args;
        GenappEnvConfig.getInstance({
            tmpOutDir: args.tmpOutDir,
            backendHost: args.backendHost,
            tmpOutZipname: args.tmpOutZipname
        });
    }

    /**
     * Restores application generator caches.
     * This method is called before starting a new generation process to ensure that no stale data is used.
     */
    private restoreGeneratorState() {
        ArtifactCache.resetCacheContent();
        AggregateMetadataCache.resetCacheContent();
    }

    private getCapabilityGenerator(capabilityIri: string, constructorInput: CapabilityConstructorInput): CapabilityGenerator {
        const capabilityMap: { [key: string]: new (input: CapabilityConstructorInput) => CapabilityGenerator } = {
            [LIST_CAPABILITY_ID]: ListCapability,
            [DETAIL_CAPABILITY_ID]: DetailCapability,
            [CREATE_CAPABILITY_ID]: CreateInstanceCapability,
            [DELETE_CAPABILITY_ID]: DeleteInstanceCapability,
            [EDIT_CAPABILITY_ID]: EditInstanceCapability,
        };

        const capabilityClass = capabilityMap[capabilityIri];
        if (!capabilityClass) {
            throw new Error(`"${capabilityIri}" does not correspond to a valid capability identifier.`);
        }

        return new capabilityClass(constructorInput);
    }

    /**
     * The entrypoint to the application graph generator. Creates application graph instance,
     * uses graph's data to generate an application prototype. When generation finishes,
     * a ZIP archive containing generated source code is created and returned.

    * @returns The buffer containing the generated ZIP archive containing generated application source code.
     */
    async generate(): Promise<Buffer> {
        this.restoreGeneratorState();
        const configReader = ConfigurationReaderFactory.createConfigurationReader(this._args);
        const zipFilename = GenappEnvConfig.TmpOutZipName;

        const appGraph: ApplicationGraph = configReader.getAppConfiguration();

        if (!appGraph.nodes || appGraph.nodes.length === 0) {
            console.error("Provided application graph does not contain any nodes to be generated.");

            const emptyBuffer = Buffer.alloc(0);
            return emptyBuffer;
        }

        await this.generateAppFromConfig(appGraph);

        const zipGenerator = new ZipArchiveGenerator(GenappEnvConfig.TmpOutDir, zipFilename);

        await zipGenerator.generateZipArchive(zipFilename);

        const generatedBuffer = await zipGenerator.getZipBuffer(zipFilename);

        setTimeout(() => {
            if (fs.existsSync(zipFilename)) {
                console.log("REMOVING zipped application artifact: ", zipFilename);
                fs.rmSync(zipFilename);
            }

            if (fs.existsSync(GenappEnvConfig.TmpOutDir)) {
                console.log("REMOVING temporary app directory: ", GenappEnvConfig.TmpOutDir);
                fs.rmSync(GenappEnvConfig.TmpOutDir, { recursive: true });
            }
        }, 5000);

        return generatedBuffer;
    }

    /**
     * Generates an application from the provided application graph.
     * This method processes each node in the given application graph by calling the `generateApplicationNode` method.
     * After all application graph nodes are generated, `ReactAppBaseGeneratorStage` is used to generate the
     * application base.
     *
     * @param appGraph - The application graph containing nodes to be processed.
     * @returns A promise that resolves when the application generation is complete.
     */
    private async generateAppFromConfig(appGraph: ApplicationGraph): Promise<void> {

        const generationPromises = appGraph.nodes.map(
            async applicationNode => {
                try {
                    const nodeResult = await this.generateApplicationNode(
                        applicationNode,
                        appGraph
                    );
                    return nodeResult;
                } catch (error) {
                    console.error(`Failed to generate node: ${applicationNode.getIri()}`, error);
                    return null;
                }
            }
        );

        const validNodeResults = (await Promise.allSettled(generationPromises))
            .filter(result => result.status === "fulfilled")
            .map(result => (result as PromiseFulfilledResult<NodeResult>).value);

        await new ReactAppBaseGeneratorStage()
            .generateApplicationBase(validNodeResults);
    }

    /**
     * Launches generation operation for an application node based on the provided graph node and application graph.

     * @param currentNode - The current node in the application graph to be generated.
     * @param graph - The application graph containing all nodes and their relationships.
     * @returns A promise that resolves to the result of the currently generated node, including artifacts as well as node metadata.
     */
    private async generateApplicationNode(currentNode: ApplicationGraphNode, graph: ApplicationGraph): Promise<NodeResult> {

        console.log("CURRENT NODE: ", currentNode);
        const structureModelMetadata = await currentNode.getNodeStructureModel();
        const { iri: capabilityIri, config: capabilityConfig } = currentNode.getCapabilityInfo();
        const capabilityLabel = currentNode.getNodeLabel("en");

        const capabilityConstructorInput: CapabilityConstructorInput = {
            capabilityLabel,
            structureModelMetadata: structureModelMetadata,
            datasource: currentNode.getDatasource(graph),
        };

        const capabilityGenerator = this.getCapabilityGenerator(capabilityIri, capabilityConstructorInput);

        const nodeArtifact = await capabilityGenerator
            .generateCapability({
                aggregate: structureModelMetadata,
                graph: graph,
                node: currentNode,
                nodeConfig: capabilityConfig,
            });

        const generatedNodeResult: NodeResult = {
            artifact: nodeArtifact,
            structure: structureModelMetadata,
            nodePath: `${structureModelMetadata.technicalLabel}/${capabilityGenerator.getLabel()}`,
            capability: {
                type: capabilityGenerator.getType(),
                label: capabilityGenerator.getLabel()
            }
        };

        return generatedNodeResult;
    }
}
