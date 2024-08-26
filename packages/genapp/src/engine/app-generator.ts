
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import {
    ApplicationGraph,
    ApplicationGraphEdge,
    ApplicationGraphNode,
    Datasource,
    DatasourceConfig,
    Iri,
    NodeResult
} from "../application-config";
import { CapabilityGenerator } from "../capabilities/capability-generator-interface";
import { CreateInstanceCapability } from "../capabilities/create-instance";
import { CustomCapabilityGenerator } from "../capabilities/custom-capability";
import { DeleteInstanceCapability } from "../capabilities/delete-instance";
import { DetailCapability } from "../capabilities/detail";
import { ListCapability } from "../capabilities/list";
import { StaticConfigurationReader } from "../config-reader";
import { LayerArtifact } from "./layer-artifact";
import { ReactAppBaseGeneratorStage } from "./react-app-base-stage";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";

class ApplicationGenerator {

    private readonly _configReader;

    constructor() {
        this._configReader = new StaticConfigurationReader();
    }

    private getCapabilityGenerator(capabilityIri: string, rootAggregateIri: Iri, datasource: Datasource): CapabilityGenerator {

        switch (capabilityIri) {
            case ListCapability.identifier:
                return new ListCapability(rootAggregateIri, datasource);
            case DetailCapability.identifier:
                return new DetailCapability(rootAggregateIri, datasource);
            case CreateInstanceCapability.identifier:
                new CreateInstanceCapability(rootAggregateIri, datasource);
            case DeleteInstanceCapability.identifier:
                new DeleteInstanceCapability(rootAggregateIri, datasource);
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
                const transitions = appGraph.getOutgoingEdges(applicationNode);
                const nodeDatasource = appGraph.getNodeDatasource(applicationNode);

                // TODO: Get result
                const nodeResult = await this.generateApplicationNode(
                    applicationNode,
                    transitions,
                    nodeDatasource
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
        appNode: ApplicationGraphNode,
        transitions: ApplicationGraphEdge[],
        datasource: Datasource
    ) : Promise<LayerArtifact> {
        const backendUrl = "http://localhost:8889";

        const structureIri = appNode.structure;


        const result = await fetch(`${backendUrl}/resources/blob?iri=${encodeURIComponent(structureIri)}`)
            .then(response => response.json())
            .catch(error => {
                console.error(`Error fetching data with PIM IRI ${structureIri}:`, error);
            });

        console.log(result);

        const structureSchema = (result as any).resources[structureIri] as DataPsmSchema;
        const aggregateName = structureSchema.dataPsmHumanLabel!.en!.toLowerCase().replace(" ", "_");

        const generator = this.getCapabilityGenerator(
            appNode.capability,
            aggregateName,
            datasource
        );

        const capabilityResult = await generator.generateCapability({
            config: appNode.config,
            transitions: transitions
        });

        return capabilityResult;
    }
}

const generator = new ApplicationGenerator();
generator.generate();
``
