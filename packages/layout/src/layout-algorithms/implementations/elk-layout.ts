import { Graph, isSubgraph, MainGraph } from "../../graph/representation/graph";



import ELK from 'elkjs/lib/elk.bundled';

import { ElkNode, ElkExtendedEdge, type ELK as ELKType } from 'elkjs/lib/elk-api';

import { ConstraintContainer, ElkConstraintContainer } from "../../configs/constraint-container";
import _ from "lodash";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces";
import { ElkGraphTransformer } from "../graph-transformers/elk-graph-transformer";


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

    // TODO: 3 following lines are for Debug
    layoutPromise.then(result => console.log("!!! performGeneralizationTwoRunLayout LAYOUTING OVER !!!"));
    layoutPromise.then(console.log);
    layoutPromise.then(result => console.log(JSON.stringify(result)));

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
        this.elk = new ELK();
    }

    // TODO RadStr: Just put everywhere main graph and be done with it
    prepareFromGraph(graph: Graph, constraintContainer: ElkConstraintContainer): void {
        this.graph = graph
        this.elkGraphTransformer = new ElkGraphTransformer(graph, constraintContainer);
        this.graphInElk = this.elkGraphTransformer.convertGraphToLibraryRepresentation(graph, true, constraintContainer),       // TODO: Why I need to pass the constraintContainer again???
        this.constraintContainer = constraintContainer;
    }

    async run(): Promise<MainGraph> {
        let layoutPromise: Promise<ElkNode | void>;
        const graphInElkWorkCopy = this.getGraphInElk();
        if(this.constraintContainer.isGeneralizationPerformedBefore()) {
            layoutPromise = performSecondPartGeneralizationTwoRunLayout(this.graph, graphInElkWorkCopy, this.elk);
        }
        else {
            layoutPromise = this.elk.layout(graphInElkWorkCopy)
                                    .catch(console.error);
        }

        console.log("elkGraph layouted");
        console.log({...graphInElkWorkCopy});


        return layoutPromise.then(layoutedGraph => {
            if(layoutedGraph !== null && typeof layoutedGraph === 'object') {       // Void check
                this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(layoutedGraph, this.graph, false, true);
            }
            return this.graph.mainGraph;            // TODO: Again main graph
        });
    }

    async runGeneralizationLayout(): Promise<MainGraph> {
        const layoutPromises: Promise<void>[] = [];
        let subgraphAllEdges: [ElkExtendedEdge[], ElkExtendedEdge[]][] = [];
        let subgraphIndices: number[] = [];

        const graphInElkWorkCopy = this.getGraphInElk();
        console.log("GRAPH BEFORE DOUBLE LAYOUTING:");
        console.log(JSON.stringify(graphInElkWorkCopy));
        for(const [index, subgraph] of graphInElkWorkCopy.children.entries()) {
            console.log(index);
            console.log(subgraph);
            if(isSubgraph(this.graph, subgraph.id)) {
                console.log(subgraph);
                subgraphIndices.push(index);
                // We use the variant which removes the edges going to the subgraph boundaries, other solution is
                // to box it inside another node and the reroute the edges there
                // (or actually don't even have to reroute if I swap the order of the subgraphs)
                const [keptEdges, removedEdges] = removeEdgesLeadingToSubgraphInsideSubgraph(subgraph);
                subgraphAllEdges.push([keptEdges, removedEdges]);
                subgraph.edges = keptEdges;
                console.log("THE layouted SUBGRAPH:");
                console.log(subgraph);
                console.log(JSON.stringify(subgraph));
                const layoutPromise = this.elk.layout(subgraph)
                    .then(console.log)
                    .catch(console.error);
                await layoutPromise;            // TODO: Just debug
                layoutPromises.push(layoutPromise);
            }
        }
        return Promise.all(layoutPromises).then(result => {
            console.log("GRAPH AFTER FIRST LAYOUTING:");
            console.log(JSON.stringify(graphInElkWorkCopy));
            for(const [i, [keptEdges, removedEdges]] of subgraphAllEdges.entries()) {
                console.log("Layouted subgraph");
                console.log(graphInElkWorkCopy.children[subgraphIndices[i]]);
                graphInElkWorkCopy.children[subgraphIndices[i]].edges = graphInElkWorkCopy.children[subgraphIndices[i]].edges.concat(removedEdges);
            }
            console.log("GRAPH AFTER FIRST LAYOUTING AND REPAIRING EDGES:");
            console.log(graphInElkWorkCopy);
            console.log(JSON.stringify(graphInElkWorkCopy));

            this.elkGraphTransformer.updateExistingGraphRepresentationBasedOnLibraryRepresentation(graphInElkWorkCopy, this.graph, false, true);
            return this.graph.mainGraph;            // TODO: Again main graph
        });
    }

    private elk: ELKType;
    protected graph: Graph;
    protected graphInElk: ElkNode;
    private getGraphInElk(): ElkNode {
        return _.cloneDeep(this.graphInElk);
    }
    protected constraintContainer: ConstraintContainer;
    private elkGraphTransformer: ElkGraphTransformer;
}
