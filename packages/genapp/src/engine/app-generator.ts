import {
    CapabilityGenerator,
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability
} from "../capabilities";
import { sep, posix } from "path";
import { parse } from "ts-command-line-args";
import { ConfigurationReaderFactory } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "../react-base/react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";
import { ApplicationGraph, ApplicationGraphNode } from "./graph";
import { AggregateMetadata } from "../application-config";
import { ListCapabilityMetadata } from "../capabilities/list";
import { DetailCapabilityMetadata } from "../capabilities/detail";
import { CreateInstanceCapabilityMetadata } from "../capabilities/create-instance";
import { DeleteInstanceCapabilityMetadata } from "../capabilities/delete-instance";

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
    appGraphPath: string;
    targetRootPath?: string;
}

class ApplicationGenerator {
    private readonly _args: GenappInputArguments;

    constructor(args: GenappInputArguments) {
        this._args = args;
    }

    private getCapabilityGenerator(capabilityIri: string, constructorInput: CapabilityConstructorInput): CapabilityGenerator {

        const listId = new ListCapabilityMetadata().getIdentifier(),
            detailId = new DetailCapabilityMetadata().getIdentifier(),
            createInstanceId = new CreateInstanceCapabilityMetadata().getIdentifier(),
            deleteInstanceId = new DeleteInstanceCapabilityMetadata().getIdentifier();

        switch (capabilityIri) {
            case listId:
                return new ListCapability(constructorInput);
            case detailId:
                return new DetailCapability(constructorInput);
            case createInstanceId:
                return new CreateInstanceCapability(constructorInput);
            case deleteInstanceId:
                return new DeleteInstanceCapability(constructorInput);
            default:
                throw new Error(`"${capabilityIri}" does not correspond to a valid capability identifier.`);
        }
    }

    async generate() {
        const configReader = ConfigurationReaderFactory.createConfigurationReader(this._args);

        const appGraph: ApplicationGraph = configReader
            .getAppConfiguration();

        this.generateAppFromConfig(appGraph);
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

        await new ReactAppBaseGeneratorStage(this._args.targetRootPath!)
            .generateApplicationBase(nodeResultMappings);

        // TODO: integrate the application base (add final application node - static app base generator)
        // config to the app base generator is the mapping of the results
        // and transitions are from the node itself to all the nodes
    }

    private async generateApplicationNode(
        currentNode: ApplicationGraphNode,
        graph: ApplicationGraph
    ): Promise<NodeResult> {
        console.log("CURRENT NODE: ", currentNode);
        const aggregateMetadata = await currentNode.getNodeDataStructure();
        const { iri: capabilityIri, config: capabilityConfig } = currentNode.getCapabilityInfo();

        const capabilityConstructorInput: CapabilityConstructorInput = {
            dataStructureMetadata: aggregateMetadata,
            datasource: currentNode.getDatasource(graph),
            saveBasePath: this._args.targetRootPath!
        };

        const capabilityGenerator = this.getCapabilityGenerator(capabilityIri, capabilityConstructorInput);

        const nodeArtifact = await capabilityGenerator
            .generateCapability({
                aggregate: aggregateMetadata,
                graph: graph,
                node: currentNode,
                config: capabilityConfig,
            });

        const result: NodeResult = {
            artifact: nodeArtifact,
            structure: aggregateMetadata,
            nodePath: `${aggregateMetadata.technicalLabel}/${capabilityGenerator.getLabel()}`,
            capability: {
                type: capabilityGenerator.getType(),
                label: capabilityGenerator.getLabel()
            }
        };

        return result;
    }
}

function main() {

    const args = parse<GenappInputArguments>(
        {
            appGraphPath: String,
            targetRootPath: { type: String, optional: true }
        });

    args.targetRootPath = (args.targetRootPath ?? ".").replaceAll(sep, posix.sep);;

    console.log(`TARGET ROOT: ${args.targetRootPath}`);
    console.log(`APP GRAPH PATH: ${args.appGraphPath}`);

    const generator = new ApplicationGenerator(args);
    generator.generate();
}

main();
