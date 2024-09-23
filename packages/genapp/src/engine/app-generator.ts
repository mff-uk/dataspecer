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
import { ConfigurationReaderFactory } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "../react-base/react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";
import { ApplicationGraph, ApplicationGraphNode } from "./graph";
import { AggregateMetadata } from "../application-config";
import * as fs from "fs";
import JSZip from "jszip";
import path from "path";

export type NodeResult = {
    structure: AggregateMetadata;
    artifact: LayerArtifact;
    nodePath: string;
    capability: {
        label: string,
        type: string
    };
};

export interface GenappInputArguments {
    appGraphFile?: string;
    serializedGraph?: string;
}

export class ApplicationGenerator {
    private readonly _args: GenappInputArguments;

    constructor(args: GenappInputArguments) {
        this._args = args;
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

    private generateZipArchiveFromGeneratedFiles(): Promise<Buffer> {
        let resultZip = new JSZip();

        fs.readdirSync("generated", { recursive: true, encoding: "utf-8" }).forEach(filename => {

            const filePath = path.join("generated", filename);

            if (fs.statSync(filePath).isDirectory()) {
                return;
            }
            console.log(`ZIPPING PATH "${filePath}"`);
            const content = fs.readFileSync(filePath, { encoding: "utf-8" });
            resultZip = resultZip.file(filePath, content);
        })

        return resultZip.generateAsync({
            type: "nodebuffer"
        });
    }

    async generate(): Promise<Buffer> {
        const configReader = ConfigurationReaderFactory.createConfigurationReader(this._args);

        const appGraph: ApplicationGraph = configReader
            .getAppConfiguration();

        await this.generateAppFromConfig(appGraph);

        return this.generateZipArchiveFromGeneratedFiles();
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

        const result: NodeResult = {
            artifact: nodeArtifact,
            structure: dataStructureMetadata,
            nodePath: `${dataStructureMetadata.technicalLabel}/${capabilityGenerator.getLabel()}`,
            capability: {
                type: capabilityGenerator.getType(),
                label: capabilityGenerator.getLabel()
            }
        };

        return result;
    }
}
