import { EntityModel } from "@dataspecer/core-v2";
import { NodeDimensionQueryHandler, VisualEntitiesWithOutsiders } from "../..";
import { ExplicitAnchors } from "../../explicit-anchors";
import { ExtractedModels } from "../../layout-algorithms/layout-algorithm-interface";
import { PhantomElementsFactory } from "../../util/utils";
import { GraphClassic, IGraphClassic, IMainGraphClassic, MainGraphClassic } from "./graph";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { EdgeEndPoint } from "./edge";

/**
 * Factory class to create graphs with.
 */
export class GraphFactory {
    /**
     * Creates graph, which is put inside the {@link mainGraph}
     * @param inputModel if null then {@link nodeContentOfGraph} needs to be set, otherwise behavior is undefined
     * @param nodeContentOfGraph the nodes which are part of the new subgraph.
     *                           The nodes are put inside of the created subgraph and in the {@link sourceGraph} are shown as one node - the newly created graph.
     * ... TODO: for now can't be null, in future it might make sense to be null.
     * For example when he we have one visual model and then we want to create subgraph which has other visual model as content (... TODO: but what about shared nodes?)
     * @param isDummy
     * @param visualModel
     * @param shouldSplitEdges if set to true, then split edges. If set to false, then just paste in the subgraph the nodes, but this results in edges going from
     * the subgraph to possibly other subgraphs, which for example elk can not deal with. In Elk the edges have to go between nodes on the same level.
     * So for this edges the split edges option. Then edge is split into 2 or 3 parts. (Note: If the edge is inside the subgraph it is kept)
     * 1st edge - From the node in the subgraph to the subgraph.
     * 2nd edge - Either the edge straight to the node, if it doesn't lies within different subgraph, or of it does, then the next part of edge goes between the subgraphs.
     * 3rd edge - from the other subgraph to the other end of the original edge.
     * @returns the created subgraph
     */
    public static createGraph(
        mainGraph: IMainGraphClassic,
        sourceGraph: IGraphClassic,
        graphIdentifier: string,
        nodeContentOfGraph: Array<EdgeEndPoint> | null,
        isDummy: boolean,
        shouldSplitEdges: boolean
    ): IGraphClassic {
        // Create subgraph which has given nodes as children (TODO: What if the nodes are not given, i.e. null?)
        const graph = new GraphClassic();
        graph.initializeWithGivenContent(
            mainGraph, sourceGraph, graphIdentifier,
            nodeContentOfGraph, isDummy, mainGraph.nodeDimensionQueryHandler);
        sourceGraph.insertSubgraphToGraph(graph, nodeContentOfGraph, shouldSplitEdges);
        return graph;
    }


    /**
     * Creates instance of main graph. Main graph is like classic subgraph, but contains additional data about all the entities stored in graph.
     * TODO: Actually do I get any advantage by having additional type (except for saving space) and what starts happening when we have subgraphs inside subgraphs???
     */
    public static createMainGraph(
        graphIdentifier: string | null,
        inputModels: Map<string, EntityModel> | ExtractedModels | null,
        visualModel: VisualModel,
        entitiesToLayout: VisualEntitiesWithOutsiders,
        nodeDimensionQueryHandler?: NodeDimensionQueryHandler | null,
        explicitAnchors?: ExplicitAnchors
    ): IMainGraphClassic {
        if(graphIdentifier === null) {
            graphIdentifier = PhantomElementsFactory.createUniquePhanomNodeIdentifier();
        }
        const graph = new MainGraphClassic();
        graph.initialize(
            graph, graph, graphIdentifier, inputModels, false,
            visualModel, entitiesToLayout, nodeDimensionQueryHandler, explicitAnchors);
        return graph;
    }
}