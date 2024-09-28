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
    DELETE_CAPABILITY_ID
} from "../capabilities";
import archiver from "archiver";
import { once } from "events";
import { ConfigurationReaderFactory } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "../react-base/react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";
import { ApplicationGraph, ApplicationGraphNode } from "./graph";
import { AggregateMetadata } from "../application-config";

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

export class GenappEnvConfig
{
    private static _instance: GenappEnvConfig;
    private readonly _envConfig: GenappEnvironmentConfig;

    private constructor(envConfig: GenappEnvironmentConfig)
    {
        this._envConfig = envConfig;
    }

    public static getInstance(envConfig: GenappEnvironmentConfig): GenappEnvConfig
    {
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

    public static get TmpOutZipName () {
        return this._instance._envConfig.tmpOutZipname;
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
            default:
                throw new Error(`"${capabilityIri}" does not correspond to a valid capability identifier.`);
        }
    }

    private async generateZipArchive(tempZipFilename: string) {
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
        zipArchive.directory(`${this._args.tmpOutDir}/`, "generatedApp");
        return zipArchive.finalize();
    }

    private async getZipBuffer(tempZipFilename: string): Promise<Buffer> {
        const readStream = fs.createReadStream(tempZipFilename);
        const buffers: Buffer[] = [];

        readStream.on("data", (d: any) => { buffers.push(Buffer.from(d)); });

        await once(readStream, "end");

        fs.rmSync(this._args.tmpOutDir, { recursive: true });
        fs.rmSync(tempZipFilename);

        return Buffer.concat(buffers);
    }

    async generate(): Promise<Buffer> {
        const configReader = ConfigurationReaderFactory.createConfigurationReader(this._args);

        const appGraph: ApplicationGraph = configReader
            .getAppConfiguration();

        await this.generateAppFromConfig(appGraph);

        const zipFilename = GenappEnvConfig.TmpOutZipName;
        await this.generateZipArchive(zipFilename);
        return await this.getZipBuffer(zipFilename);
    }

    private async generateAppFromConfig(appGraph: ApplicationGraph) {
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

        console.log("MAPPING: ", nodeResultMappings);

        await new ReactAppBaseGeneratorStage()
            .generateApplicationBase(nodeResultMappings);
    }

    private async generateApplicationNode(
        currentNode: ApplicationGraphNode,
        graph: ApplicationGraph
    ): Promise<NodeResult> {
        console.log("CURRENT NODE: ", currentNode);
        const dataStructureMetadata = await currentNode.getNodeDataStructure();
        const { iri: capabilityIri, config: capabilityConfig } = currentNode.getCapabilityInfo();
        const capabilityLabel = currentNode.getNodeLabel("en");

        const capabilityConstructorInput: CapabilityConstructorInput = {
            capabilityLabel,
            dataStructureMetadata,
            datasource: currentNode.getDatasource(graph),
        };

        const capabilityGenerator = this.getCapabilityGenerator(capabilityIri, capabilityConstructorInput);

        const nodeArtifact = await capabilityGenerator
            .generateCapability({
                aggregate: dataStructureMetadata,
                graph: graph,
                node: currentNode,
                nodeConfig: capabilityConfig,
            });

        const generatedNodeResult: NodeResult = {
            artifact: nodeArtifact,
            structure: dataStructureMetadata,
            nodePath: `${dataStructureMetadata.technicalLabel}/${capabilityGenerator.getLabel()}`,
            capability: {
                type: capabilityGenerator.getType(),
                label: capabilityGenerator.getLabel()
            }
        };

        return generatedNodeResult;
    }
}
