import { Graph, isSubgraph, MainGraph } from "../../graph/representation/graph.ts";



import ELK from "elkjs/lib/elk.bundled.js"; // Importing non-standard export

import { ElkNode, ElkExtendedEdge, type ELK as ELKType } from "elkjs/lib/elk-api.js"; // Importing non-standard export

import { ConfigurationsContainer, ElkConfigurationsContainer } from "../../configurations/configurations-container.ts";
import _ from "lodash";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces.ts";
import { ElkGraphTransformer } from "../graph-transformers/elk-graph-transformer.ts";


/**
 * Runs the second part of generalization two run layout. The first part is layout of the internals of subgraphs. The second part, which is performed in this method is
 * the positioning of the subgraphs.
 */
async function performSecondPartGeneralizationTwoRunLayout(graph: Graph, graphInElk: ElkNode, elk): Promise<ElkNode | void> {
    for(const subgraph of graphInElk.children) {
        if(isSubgraph(graph, subgraph.id)) {
            // Actually I think that this is not needed
            fixNodesInsideGraph(subgraph);
        }
    }

    const layoutPromise = elk.layout(graphInElk)
                             .catch(console.error);

    return layoutPromise;
}


/**
 * Fixes nodes in {@link graph} so they are not layouted (their relative positioning within the subgraph is kept) when we are deciding the
 * positioning of the subgraphs in the {@link performSecondPartGeneralizationTwoRunLayout}
 */
function fixNodesInsideGraph(graph: ElkNode) {
    graph.layoutOptions = {};
    graph.layoutOptions['elk.algorithm'] = 'fixed';
}


/**
 * Removes edges where either the target or source is the given {@link subgraph}
 * @returns The kept edges and the removed edges ... in this order
 */
function removeEdgesLeadingToSubgraphInsideSubgraph(subgraph: ElkNode): [ElkExtendedEdge[], ElkExtendedEdge[]] {
    const keptEdges: ElkExtendedEdge[] = [];
    const removedEdges: ElkExtendedEdge[] = [];
    for(const e of subgraph.edges) {
        if(e.sources[0] === subgraph.id || e.targets[0] === subgraph.id) {
            removedEdges.push(e);
        }
        else {
            keptEdges.push(e);
        }
    }

    return [keptEdges, removedEdges];
}


/**
 * Class which handles the act of layouting within the ELK layouting library. For more info check docs of {@link LayoutAlgorithm} interface, which this class implements.
 */
export class ElkLayout implements LayoutAlgorithm {
    constructor() {
        // @ts-ignore Issues with importing ELK
        this.elk = new ELK();
    }

    prepareFromGraph(graph: Graph, configurations: ElkConfigurationsContainer): void {
        this.graph = graph
        this.elkGraphTransformer = new ElkGraphTransformer(graph, configurations);
        this.graphInElk = this.elkGraphTransformer.convertGraphToLibraryRepresentation(graph, true, configurations),
        this.configurations = configurations;
    }

    async run(): Promise<MainGraph> {
        let layoutPromise: Promise<ElkNode | void>;
        const graphInElkWorkCopy = this.getGraphInElk();
        if(this.configurations.isGeneralizationPerformedBefore()) {
            layoutPromise = performSecondPartGeneralizationTwoRunLayout(this.graph, graphInElkWorkCopy, this.elk);
        }
        else {
            layoutPromise = this.elk.layout(graphInElkWorkCopy)
                                    .catch(console.error);
        }

        return layoutPromise.then(layoutedGraph => {
            if(layoutedGraph !== null && typeof layoutedGraph === 'object') {       // Void check
                this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(layoutedGraph, this.graph, false, true);
            }
            return this.graph.mainGraph;
        });
    }

    async runGeneralizationLayout(): Promise<MainGraph> {
        const layoutPromises: Promise<void>[] = [];
        let subgraphAllEdges: [ElkExtendedEdge[], ElkExtendedEdge[]][] = [];
        let subgraphIndices: number[] = [];

        const graphInElkWorkCopy = this.getGraphInElk();
        for(const [index, subgraph] of graphInElkWorkCopy.children.entries()) {
            if(isSubgraph(this.graph, subgraph.id)) {
                subgraphIndices.push(index);
                // We use the variant which removes the edges going to the subgraph boundaries, other solution is
                // to box it inside another node and the reroute the edges there
                // (or actually don't even have to reroute if I swap the order of the subgraphs)
                const [keptEdges, removedEdges] = removeEdgesLeadingToSubgraphInsideSubgraph(subgraph);
                subgraphAllEdges.push([keptEdges, removedEdges]);
                subgraph.edges = keptEdges;
                const layoutPromise = this.elk.layout(subgraph)
                    .then(console.log)
                    .catch(console.error);
                await layoutPromise;            // TODO: Just debug, but I will keep it, so I don't break anything
                layoutPromises.push(layoutPromise);
            }
        }
        return Promise.all(layoutPromises).then(result => {
            for(const [i, [keptEdges, removedEdges]] of subgraphAllEdges.entries()) {
                graphInElkWorkCopy.children[subgraphIndices[i]].edges = graphInElkWorkCopy.children[subgraphIndices[i]].edges.concat(removedEdges);
            }

            this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(graphInElkWorkCopy, this.graph, false, true);
            return this.graph.mainGraph;
        });
    }

    private elk: ELKType;
    protected graph: Graph;
    protected graphInElk: ElkNode;
    private getGraphInElk(): ElkNode {
        return _.cloneDeep(this.graphInElk);
    }
    protected configurations: ConfigurationsContainer;
    private elkGraphTransformer: ElkGraphTransformer;
}
