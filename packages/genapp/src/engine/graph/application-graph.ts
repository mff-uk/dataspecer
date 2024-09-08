import { Datasource } from "./datasource";
import { ApplicationGraphEdge } from "./application-graph-edge";
import { ApplicationGraphNode } from "./application-graph-node";

export interface ApplicationGraphType {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNode[];
    edges: ApplicationGraphEdge[];
    specificationIri: string;
}

export class ApplicationGraph implements ApplicationGraphType {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNode[];
    edges: ApplicationGraphEdge[];
    specificationIri: string;

    constructor(
        label: string,
        datasources: Datasource[],
        nodes: ApplicationGraphNode[],
        edges: ApplicationGraphEdge[],
        specificationIri: string
    ) {
        this.label = label;
        this.nodes = nodes;
        this.datasources = datasources;
        this.edges = edges;
        this.specificationIri = specificationIri;
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
