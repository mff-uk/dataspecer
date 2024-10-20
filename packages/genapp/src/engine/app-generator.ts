import * as fs from "fs";
import {
    CapabilityGenerator,
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability,
    LIST_CAPABILITY_ID,
    DETAIL_CAPABILITY_ID,
    CREATE_CAPABILITY_ID,
    DELETE_CAPABILITY_ID,
    EDIT_CAPABILITY_ID
} from "../capabilities";
import archiver from "archiver";
import { once } from "events";
import { ConfigurationReaderFactory } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "../react-base/react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";
import { ApplicationGraph, ApplicationGraphNode } from "./graph";
import { AggregateMetadata, AggregateMetadataCache } from "../application-config";
import { ArtifactCache } from "../utils/artifact-saver";
import { EditInstanceCapability } from "../capabilities/edit-instance";

export type NodeResult = {
    structure: AggregateMetadata;
    artifact: LayerArtifact;
    nodePath: string;
    capability: {
        label: string,
        type: string
    };
};

interface GenappEnvironmentConfig {
    backendHost: string;
    tmpOutZipname: string;
    tmpOutDir: string;
}

export interface GenappConfiguration extends GenappEnvironmentConfig {
    appGraphFile?: string;
    serializedGraph?: string;
}

export class GenappEnvConfig {
    private static _instance: GenappEnvConfig;
    private readonly _envConfig: GenappEnvironmentConfig;

    private constructor(envConfig: GenappEnvironmentConfig) {
        this._envConfig = envConfig;
    }

    public static getInstance(envConfig: GenappEnvironmentConfig): GenappEnvConfig {
        if (!this._instance) {
            this._instance = new this(envConfig);
        }

        return this._instance;
    }

    public static get Host() {
        return this._instance._envConfig.backendHost;
    }

    public static get TmpOutDir() {
        return this._instance._envConfig.tmpOutDir;
    }

    public static get TmpOutZipName() {
        return this._instance._envConfig.tmpOutZipname;
    }

}

class ZipArchiveGenerator {

    private readonly _outDir: string;
    private readonly _outFile: string;

    constructor(outDir: string, outFile: string) {
        this._outDir = outDir;
        this._outFile = outFile;
    }

    async generateZipArchive(tempZipFilename: string) {
        const output = fs.createWriteStream(tempZipFilename);
        const zipArchive = archiver("zip", {
            statConcurrency: 2,
            zlib: { level: 9 }
        });

        output.on("close", () => { console.log(`${zipArchive.pointer()} B written`) });

        zipArchive.on("warning", function (err) {
            if (err.code === 'ENOENT') {
                // log warning
            } else {
                // throw error
                throw err;
            }
        });

        zipArchive.on("error", err => { throw err; });

        zipArchive.pipe(output);
        zipArchive.directory(`${this._outDir}/`, "generatedApp");
        return zipArchive.finalize();
    }

    async getZipBuffer(tempZipFilename: string): Promise<Buffer> {
        const readStream = fs.createReadStream(tempZipFilename);
        const buffers: Buffer[] = [];

        readStream.on("data", (d: any) => { buffers.push(Buffer.from(d)); });

        await once(readStream, "end");

        return Buffer.concat(buffers);
    }
}

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

    private restoreGeneratorState() {
        ArtifactCache.resetCacheContent();
        AggregateMetadataCache.resetCacheContent();
    }

    private getCapabilityGenerator(capabilityIri: string, constructorInput: CapabilityConstructorInput): CapabilityGenerator {

        switch (capabilityIri) {
            case LIST_CAPABILITY_ID:
                return new ListCapability(constructorInput);
            case DETAIL_CAPABILITY_ID:
                return new DetailCapability(constructorInput);
            case CREATE_CAPABILITY_ID:
                return new CreateInstanceCapability(constructorInput);
            case DELETE_CAPABILITY_ID:
                return new DeleteInstanceCapability(constructorInput);
            case EDIT_CAPABILITY_ID:
                return new EditInstanceCapability(constructorInput);
            default:
                throw new Error(`"${capabilityIri}" does not correspond to a valid capability identifier.`);
        }
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

        const zipGenerator = new ZipArchiveGenerator(GenappEnvConfig.TmpOutDir, zipFilename)

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

    private async generateAppFromConfig(appGraph: ApplicationGraph) {

        if (!appGraph.nodes || appGraph.nodes.length === 0) {
            console.error("Provided application graph does not contain any nodes to be generated.");
            return;
        }

        const generationPromises = appGraph.nodes.map(
            async applicationNode => {

                const nodeResult = await this.generateApplicationNode(
                    applicationNode,
                    appGraph
                );

                return nodeResult;
            }
        );

        const nodeResultMappings = await Promise.all(generationPromises);

        await new ReactAppBaseGeneratorStage()
            .generateApplicationBase(nodeResultMappings);
    }

    private async generateApplicationNode(
        currentNode: ApplicationGraphNode,
        graph: ApplicationGraph
    ): Promise<NodeResult> {

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
