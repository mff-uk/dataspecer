import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { LayerArtifact } from "./engine/layer-artifact";
import DalApi from "./data-layer/dal-generator-api";
import { toPascalCase } from "./utils/utils";

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

export type Iri = string;

export type Datasource = {
    label: string;
} & DatasourceConfig;

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

    public async getNodeDataStructure(): Promise<DataPsmSchema> {
        
        const dataStructure = await new DalApi("http://localhost:8889")
            .getStructureInfo(this._node.structure);

        return dataStructure;
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
            .filter(node => node.getIri() === iri);

        if (!matchingNodes || matchingNodes.length !== 1) {
            return null;
        }

        return matchingNodes[0]!;
    }

    getNodesByRootDataStructure(rootStructureIri: string): ApplicationGraphNode[] {
        return this.nodes
            .filter(node => node.getStructureIri() === rootStructureIri);
    }
}

export type NodeResult = {
    node: ApplicationGraphNode;
    result: LayerArtifact;
}

export class AggregateMetadata {
    private readonly _dataStructure: DataPsmSchema;
    public readonly iri: string;
    public readonly aggregateName: string;
    public readonly technicalLabel: string;
    public readonly roots: string[];

    constructor(structure: DataPsmSchema) {
        this._dataStructure = structure;
        
        this.iri = this._dataStructure.iri!;
        this.aggregateName = this.getAggregateName(structure);
        this.technicalLabel = structure.dataPsmTechnicalLabel ?? this.aggregateName.toLowerCase();
        this.roots = structure.dataPsmRoots;   
    }
    
    private getAggregateName(structure: DataPsmSchema): string {

        if (structure.dataPsmTechnicalLabel) {
            return structure.dataPsmTechnicalLabel;
        }

        if (!structure.dataPsmHumanLabel ||
            Object.keys(structure.dataPsmHumanLabel).length === 0) {
            throw new Error(`Data structure ${structure.iri} is missing a name.`);
        }

        const labelKeys = Object.keys(structure.dataPsmHumanLabel);

        const humanLabel = labelKeys.includes("en")
            ? structure.dataPsmHumanLabel["en"]!
            : structure.dataPsmHumanLabel[labelKeys.at(0)!]!;

        const aggregateName = humanLabel
            .toLowerCase()
            .replaceAll(/\s+/, "-");

        return aggregateName;
    }

    public getAggregateNamePascalCase({ prefix, suffix }: { prefix?: string, suffix?: string } = {}): string {
        return `${prefix ?? ""}${toPascalCase(this.aggregateName)}${suffix ?? ""}`;
    }
}