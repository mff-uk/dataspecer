import { Datasource } from "./datasource";
import { ApplicationGraphEdge } from "./application-graph-edge";
import { ApplicationGraphNode, ApplicationGraphNodeType } from "./application-graph-node";

export interface ApplicationGraphType {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNodeType[];
    edges: ApplicationGraphEdge[];
    dataSpecification: string;
}

export class ApplicationGraph {
    label: string;
    datasources: Datasource[];
    nodes: ApplicationGraphNode[];
    edges: ApplicationGraphEdge[];
    specificationIri: string;

    constructor(
        label: string,
        datasources: Datasource[],
        nodes: ApplicationGraphNodeType[],
        edges: ApplicationGraphEdge[],
        specificationIri: string
    ) {
        // TODO: validation - check if all node IRIs are unique
        // TODO: validation - check if all edge IRIs are unique
        this.label = label;
        this.nodes = nodes.map(n => new ApplicationGraphNode(specificationIri, n));
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
