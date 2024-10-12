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

    private getUniqueNodes(nodes: ApplicationGraphNodeType[]): ApplicationGraphNodeType[] {
        const nodeUniqueIris = nodes.reduce<Set<string>>(
            (uniqueIris: Set<string>, currentNode: ApplicationGraphNodeType) => {

                if (uniqueIris.has(currentNode.iri)) {
                    return uniqueIris;
                }

                return uniqueIris.add(currentNode.iri);
            },
            new Set<string>()
        );

        if (nodeUniqueIris.size === nodes.length) {
            return nodes;
        }


        console.error(`Provided graph contains nodes with duplicate node IRIs. Nodes count: ${nodes.length} with ${nodeUniqueIris.size} unique values.`);

        // filter out nodes with duplicate IRIs (only keep the first node for each IRI)
        const uniqueNodes = [...nodeUniqueIris].map(nodeUniqueIri => nodes.find(node => node.iri === nodeUniqueIri)!)
        return uniqueNodes;
    }

    private getUniqueEdges(edges: ApplicationGraphEdge[]): ApplicationGraphEdge[] {
        const uniqueEdgeIris = edges.reduce<Set<string>>(
            (uniqueIris: Set<string>, currentEdge: ApplicationGraphEdge) => {

                if (uniqueIris.has(currentEdge.iri)) {
                    return uniqueIris;
                }

                return uniqueIris.add(currentEdge.iri);
            },
            new Set<string>()
        );

        if (uniqueEdgeIris.size === edges.length) {
            return edges;
        }


        console.error(`Provided graph contains edges with duplicate edge IRIs. Edges count: ${edges.length} with ${uniqueEdgeIris.size} unique values.`);

        // filter out nodes with duplicate IRIs (only keep the first node for each IRI)
        const uniqueEdges = [...uniqueEdgeIris].map(uniqueEdgeIri => edges.find(edge => edge.iri === uniqueEdgeIri)!)
        return uniqueEdges;
    }

    constructor(
        label: string,
        datasources: Datasource[],
        nodes: ApplicationGraphNodeType[],
        edges: ApplicationGraphEdge[],
        specificationIri: string
    ) {
        nodes = this.getUniqueNodes(nodes);
        edges = this.getUniqueEdges(edges);


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
