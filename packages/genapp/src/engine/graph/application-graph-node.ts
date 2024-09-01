import { AggregateMetadata, Iri } from "../../application-config";
import DalApi from "../../data-layer/dal-generator-api";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { ApplicationGraphEdge } from "./application-graph-edge";
import { ApplicationGraph } from "./application-graph";

export type ApplicationGraphNodeType = {
    iri: Iri;        // node iri
    structure: Iri;  // iri of the datastructure the node refers to
    capability: Iri; // iri of the dataspecer defined capability 
    config: object;     // key-value pairs specific for the specific capability
}

export class ApplicationGraphNode {
    private readonly _node: ApplicationGraphNodeType;

    constructor(node: ApplicationGraphNodeType) {
        this._node = node;
    }

    public getIri() {
        return this._node.iri;
    }

    public getCapabilityInfo() {
        return {
            iri: this._node.capability,
            config: this._node.config
        };
    }

    public getStructureIri() {
        return this._node.structure;
    }

    public async getNodeDataStructure(): Promise<AggregateMetadata> {

        const dataStructure = await new DalApi("http://localhost:8889")
            .getStructureInfo(this._node.structure);

        return new AggregateMetadata(dataStructure);
    }

    public getOutgoingEdges(graph: ApplicationGraph): ApplicationGraphEdge[] {
        return graph
            .edges
            .filter(edge => edge.source === this._node.iri);
    }

    public getIncomingEdges(graph: ApplicationGraph): ApplicationGraphEdge[] {
        return graph
            .edges
            .filter(edge => edge.target === this._node.iri);
    }

    public getDatasource(graph: ApplicationGraph) {
        let datasource = graph.datasources.at(0);

        if (!datasource) {
            throw new Error("Must contain at least 1 datasource");
        }

        return datasource;
    }
}
