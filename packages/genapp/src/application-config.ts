import { LayerArtifact } from "./engine/layer-artifact";

export enum DataSourceType {
    Local,
    Json,
    Rdf,
    Xml,
    Csv
}

export type LocalDatasource = { format: DataSourceType.Local }
export type UriDatasource = {
    format: DataSourceType.Json | DataSourceType.Csv | DataSourceType.Rdf | DataSourceType.Xml,
    endpoint: string
};

export type DatasourceConfig = LocalDatasource | UriDatasource;

export interface CapabilityConfiguration {
    transitions: ApplicationGraphEdge[];
    config: object;
}

export type Iri = string;

export type Datasource = {
    label: string;
} & DatasourceConfig;

export type ApplicationGraphNode = {
    iri: Iri;        // node iri
    structure: Iri;  // iri of the datastructure the node refers to
    capability: Iri; // iri of the dataspecer defined capability 
    config: object;     // key-value pairs specific for the specific capability
}

export enum ApplicationGraphEdgeType {
    Transition,
    Aggregation,
    Redirection
}

export type ApplicationGraphEdge = {
    iri: Iri;    // edge iri
    source: Iri; // outgoing node iri
    target: Iri; // incoming node iri
    type: ApplicationGraphEdgeType;
}

export interface ApplicationGraphType {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNode[];
    edges: ApplicationGraphEdge[];
}

export class ApplicationGraph implements ApplicationGraphType {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNode[];
    edges: ApplicationGraphEdge[];

    constructor(
        label: string,
        datasources: Datasource[],
        nodes: ApplicationGraphNode[],
        edges: ApplicationGraphEdge[]
    ) {
        this.label = label;
        this.nodes = nodes;
        this.datasources = datasources;
        this.edges = edges;
    }

    getNodeByIri(iri: string): ApplicationGraphNode | null {
        let matchingNodes = this.nodes
            .filter(node => node.iri === iri);

        if (!matchingNodes || matchingNodes.length !== 1) {
            return null;
        }

        return matchingNodes[0]!;
    }

    getNodesByRootDataStructure(rootStructureIri: string): ApplicationGraphNode[] {
        return this.nodes
            .filter(node => node.structure === rootStructureIri);
    }

    // TODO: move to node class
    getOutgoingEdges(node: ApplicationGraphNode): ApplicationGraphEdge[] {
        return this
            .edges
            .filter(edge => edge.source === node.iri);
    }

    getIncomingEdges(node: ApplicationGraphNode): ApplicationGraphEdge[] {
        return this
            .edges
            .filter(edge => edge.target === node.iri);
    }

    getNodeDatasource(applicationNode: ApplicationGraphNode) {
        let datasource = this.datasources.at(0);

        if (!datasource) {
            throw new Error("Must contain at least 1 datasource");
        }

        return datasource;
    }
}

export type NodeResult = {
    node: ApplicationGraphNode;
    result: LayerArtifact;
}