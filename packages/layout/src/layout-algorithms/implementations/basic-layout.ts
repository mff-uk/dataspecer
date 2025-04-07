import { ConstraintContainer } from "../../configs/constraint-container";
import { Graph, MainGraph, } from "../../graph/representation/graph";
import _ from "lodash";
import { VisualNode } from "@dataspecer/core-v2/visual-model";
import { LayoutAlgorithm } from "../layout-algorithms-interfaces";


/**
 * Layout nodes of given graph using custom made random layout algorithm.
 */
export async function doRandomLayoutAdvancedFromGraph(graph: Graph): Promise<MainGraph> {
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

    runGeneralizationLayout(): Promise<MainGraph> {
        throw new Error("Implement me if necessary");
    }
    run(): Promise<MainGraph> {
        return doRandomLayoutAdvancedFromGraph(this.graph);
    }

    private graph: Graph;
}
