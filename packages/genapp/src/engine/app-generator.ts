
import {
    ApplicationGraph,
    ApplicationGraphNode,
    NodeResult
} from "../application-config";
import { CapabilityGenerator } from "../capabilities/capability-generator-interface";
import { CreateInstanceCapability } from "../capabilities/create-instance";
import { DeleteInstanceCapability } from "../capabilities/delete-instance";
import { DetailCapability } from "../capabilities/detail";
import { ListCapability } from "../capabilities/list";
import { StaticConfigurationReader } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "./react-app-base-stage";
import { CapabilityConstructorInput } from "../capabilities/constructor-input";

class ApplicationGenerator {

    private readonly _configReader;

    constructor() {
        this._configReader = new StaticConfigurationReader();
    }

    private getCapabilityGenerator(
        capabilityIri: string,
        constructorInput: CapabilityConstructorInput): CapabilityGenerator {

        switch (capabilityIri) {
            case ListCapability.identifier:
                return new ListCapability(constructorInput);
            case DetailCapability.identifier:
                return new DetailCapability(constructorInput);
            case CreateInstanceCapability.identifier:
                new CreateInstanceCapability(constructorInput);
            case DeleteInstanceCapability.identifier:
                new DeleteInstanceCapability(constructorInput);
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

                // TODO: Get result
                const nodeResult = await this.generateApplicationNode(
                    applicationNode,
                    appGraph
                );

                return {
                    node: applicationNode,
                    result: nodeResult
                } as NodeResult;
            }
        );

        const nodeResultMappings = await Promise.all(generationPromises);
        // TODO: integrate the application base (add final application node - static app base generator)
        // config to the app base generator is the mapping of the results
        // and transitions are from the node itself to all the nodes
    }

    private async generateApplicationNode(
        currentNode: ApplicationGraphNode,
        graph: ApplicationGraph // TODO: remove when not needed
    ): Promise<LayerArtifact> {

        const dataStructure = await currentNode.getNodeDataStructure();
        const { iri: capabilityIri, config: capabilityConfig } = currentNode.getCapabilityInfo();

        const capabilityConstructorInput: CapabilityConstructorInput = {
            dataStructure: dataStructure,
            datasource: currentNode.getDatasource(graph)
        };

        const capabilityResult = await (this
            .getCapabilityGenerator(capabilityIri, capabilityConstructorInput))
            .generateCapability({
                graph: graph,
                node: currentNode,
                config: capabilityConfig,
            });

        return capabilityResult;
    }
}

const generator = new ApplicationGenerator();
generator.generate();
