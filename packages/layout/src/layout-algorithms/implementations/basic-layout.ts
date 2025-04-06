import { ConstraintContainer } from "../../configs/constraint-container";
import { Graph, MainGraph, } from "../../graph/representation/graph";
import _ from "lodash";
import { VisualNode } from "@dataspecer/core-v2/visual-model";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces";


/**
 * Layout nodes of given graph using custom made random layout algorithm.
 */
export async function doRandomLayoutAdvancedFromGraph(graph: Graph, shouldCreateNewGraph: boolean): Promise<MainGraph> {
    // TODO: Maybe this should be like "super", because it is always the same - if I want to create new graph then I create copy and change this graph instead of the old one
    //       Here I do it in place, normally this would be called in the Transformer before conversion from the library representation to the graph representation.
    if(shouldCreateNewGraph) {
        graph = _.cloneDeep(graph);
    }
    const classNodes = Object.values(graph.nodes).filter(node => !node.isDummy);
    classNodes.forEach(classNode => {
        let visualNode: VisualNode;
        if(classNode?.completeVisualNode?.isAnchored === true) {
            visualNode = classNode.completeVisualNode.coreVisualNode;
        }
        else {
            classNode.completeVisualNode.setPositionInCoreVisualNode(Math.ceil(Math.random() * 400 * Math.sqrt(classNodes.length)),
                                                                     Math.ceil(Math.random() * 250 * Math.sqrt(classNodes.length)));
            for (const edge of classNode.getAllOutgoingEdges()) {
                edge.visualEdge.visualEdge.waypoints = [];
            }
        }
    });
    return graph.mainGraph;     // TODO: !!! Well should it be mainGraph or not? what should we do if we want to layout only part of the graph - only the given argument?
}


/**
 * The run method of this class performs random layout of prepared graph.
 */
export class RandomLayout implements LayoutAlgorithm {

    prepareFromGraph(graph: Graph, _constraintContainer: ConstraintContainer): void {
        this.graph = graph;
    }

    runGeneralizationLayout(shouldCreateNewGraph: boolean): Promise<MainGraph> {
        throw new Error("Implement me if necessary");
    }
    run(shouldCreateNewGraph: boolean): Promise<MainGraph> {
        return doRandomLayoutAdvancedFromGraph(this.graph, shouldCreateNewGraph);
    }

    private graph: Graph;
}
