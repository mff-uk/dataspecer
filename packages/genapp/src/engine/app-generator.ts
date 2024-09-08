import {
    CapabilityGenerator,
    ListCapability,
    DetailCapability,
    CreateInstanceCapability,
    DeleteInstanceCapability
} from "../capabilities";
import { StaticConfigurationReader } from "../config-reader";
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

class ApplicationGenerator {

    private readonly _configReader;

    constructor() {
        this._configReader = new StaticConfigurationReader();
    }

    private getCapabilityGenerator(capabilityIri: string, constructorInput: CapabilityConstructorInput): CapabilityGenerator {

        switch (capabilityIri) {
            case ListCapability.identifier:
                return new ListCapability(constructorInput);
            case DetailCapability.identifier:
                return new DetailCapability(constructorInput);
            case CreateInstanceCapability.identifier:
                return new CreateInstanceCapability(constructorInput);
            case DeleteInstanceCapability.identifier:
                return new DeleteInstanceCapability(constructorInput);
            default:
                throw new Error(`"${capabilityIri}" does not correspond to a valid capability identifier.`);
        }
    }

    async generate() {

        // // TODO: iterate through graph nodes and match outgoing edges
        // // validate / filter list of valid edges and generate capabilities

        // // TODO: retrieve result for each generated node and map the result to the specified capability

        // // TODO: based on edges, generate remaining capability nodes
        // // i.e. nodes that are targets of an edge, but have not yet been generated

        // // at the end of app generation, there must not be a node which is not generated (or is a target that is not generated)

        // for (const aggregateName of this._configReader.getRootAggregateNames()) {
        //     const aggregateGeneratedCapabilities = await this.processAggregateGeneration(aggregateName);

        //     generatedArtifactsByAggregateName[aggregateName] = aggregateGeneratedCapabilities;
        // }

        // console.log("~".repeat(100));
        // console.log(generatedArtifactsByAggregateName);
        // const baseGeneratorStage = new ReactAppBaseGeneratorStage();

        // const appBaseArtifact = baseGeneratorStage.generateApplicationBase(generatedArtifactsByAggregateName);
        // baseGeneratorStage.artifactSaver.saveArtifact(appBaseArtifact);

        const appGraph: ApplicationGraph = this._configReader.getAppConfiguration();
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

        await new ReactAppBaseGeneratorStage()
            .generateApplicationBase(nodeResultMappings);

        // TODO: integrate the application base (add final application node - static app base generator)
        // config to the app base generator is the mapping of the results
        // and transitions are from the node itself to all the nodes
    }

    private async generateApplicationNode(
        currentNode: ApplicationGraphNode,
        graph: ApplicationGraph
    ): Promise<NodeResult> {

        const aggregateMetadata = await currentNode.getNodeDataStructure();
        const { iri: capabilityIri, config: capabilityConfig } = currentNode.getCapabilityInfo();

        const capabilityConstructorInput: CapabilityConstructorInput = {
            dataStructureMetadata: aggregateMetadata,
            datasource: currentNode.getDatasource(graph)
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
            nodePath: `${aggregateMetadata.technicalLabel}/${capabilityGenerator.getCapabilityLabel()}`,
            capability: {
                type: capabilityGenerator.getType(),
                label: capabilityGenerator.getCapabilityLabel()
            }
        };

        return result;
    }
}

const generator = new ApplicationGenerator();
generator.generate();
