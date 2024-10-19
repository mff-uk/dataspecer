import { Datasource } from "./datasource";
import { ApplicationGraphEdge } from "./application-graph-edge";
import { ApplicationGraphNode, ApplicationGraphNodeFactory, ApplicationGraphNodeType } from "./application-graph-node";

/**
 * ApplicationGraphType interface represents the structure for generator's application graph.
 * Application graph serves as a model of the application to be generated and is a formal
 * representation of user's requirements on the application content.
 */
export interface ApplicationGraphType {
    /**
     * The label or name of the application graph. Label is a human-readable graph identifier.
     */
    label: string;

    /**
     * Represents the list of data sources to be used. Currently, only first datasource is considered.
     *
     * @see Datasource
     */

    datasources: Datasource[];

    /**
     * List of application graph nodes, where each node represents a separate, isolated functional unit of the application, that will be generated.
     *
     * @see ApplicationGraphNodeType
     */
    nodes: ApplicationGraphNodeType[];

    /**
     * A list of edges - transitions - between the nodes in the graph.
     * Each edge allows the user of the generated application to move from one
     * capability performed on an aggregate to other capability performed on another aggregate.
     *
     * @see ApplicationGraphEdge
     */
    edges: ApplicationGraphEdge[];

    /**
     * IRI of a Dataspecer data specification from which the application is to be generated. All IRIs within application graph nodes refer to structural models within the context of this data specification.
     */
    dataSpecification: string;
}

/**
 * @inheritdoc{ApplicationGraphType}
 */
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

        if (nodeUniqueIris.size !== nodes.length) {
            throw new Error(`Provided graph contains nodes with duplicate node IRIs. Nodes count: ${nodes.length} with ${nodeUniqueIris.size} unique values. Please make sure nodes have unique IRI values.`);
        }

        return nodes;
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

        if (uniqueEdgeIris.size !== edges.length) {
            throw new Error(`Provided graph contains edges with duplicate edge IRIs. Edges count: ${edges.length} with ${uniqueEdgeIris.size} unique values.`);
        }

        return edges;
    }

    private validateEdgeEndNodes(edges: ApplicationGraphEdge[], nodes: ApplicationGraphNodeType[]): void {
        edges.forEach(edge => {
            const hasValidSourceNode = nodes.find(node => node.iri === edge.source) !== undefined;
            const hasValidTargetNode = nodes.find(node => node.iri === edge.target) !== undefined;

            if (!hasValidSourceNode || !hasValidTargetNode) {
                throw new Error(`Edge identified by IRI "${edge.iri}" contains a node end which is not defined: "${edge.source}" / "${edge.target}"`);
            }
        })
    }

    private getNodeInstances(specificationIri: string, nodes: ApplicationGraphNodeType[]): ApplicationGraphNode[] {

        const updatedNodes = nodes.reduce((acc, currentNode) => {

            if (acc.find(node => node.getIri() === currentNode.iri)) {
                // node instance with this iri has been created already; skip
                return acc;
            }

            const nodeInstance = ApplicationGraphNodeFactory.createNodeInstance(specificationIri, currentNode);
            const parentNodes = nodeInstance.generateParentNodes(nodes);

            acc = acc.concat(parentNodes);
            acc.push(nodeInstance);
            return acc;
        },
            [] as ApplicationGraphNode[]);

        return updatedNodes;
    }

    constructor(graphType: ApplicationGraphType) {

        this.label = graphType.label;
        this.nodes = this.getNodeInstances(
            graphType.dataSpecification,
            this.getUniqueNodes(graphType.nodes)
        );
        this.datasources = graphType.datasources;
        this.edges = this.getUniqueEdges(graphType.edges);
        this.specificationIri = graphType.dataSpecification;
    }

    getNodeByIri(iri: string): ApplicationGraphNode | null {
        let matchingNodes = this.nodes
            .filter(node => node.getIri() === iri);

        if (!matchingNodes || matchingNodes.length !== 1) {
            return null;
        }

        return matchingNodes[0]!;
    }

    getNodesByRootStructure(rootStructureIri: string): ApplicationGraphNode[] {
        return this.nodes
            .filter(node => node.getStructureIri() === rootStructureIri);
    }
}
