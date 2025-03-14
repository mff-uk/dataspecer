import { LayoutAlgorithm } from "./layout-iface";
import { ConstraintContainer } from "./configs/constraint-container";
import { IGraphClassic, IMainGraphClassic, } from "./graph-iface";
import _ from "lodash";
import { VisualNode } from "@dataspecer/core-v2/visual-model";


/**
 * Layout nodes of given graph using custom made random layout algorithm.
 */
export async function doRandomLayoutAdvancedFromGraph(graph: IGraphClassic, shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
    // TOOD: Maybe this should be like "super", because it is always the same - if I want to create new graph then I create copy and change this graph instead of the old one
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

    prepareFromGraph(graph: IGraphClassic, constraintContainer: ConstraintContainer): void {
        this.graph = graph;
        this.constraintContainer = constraintContainer;
    }

    runGeneralizationLayout(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        throw new Error("TODO: Implement me if necessary");
    }
    run(shouldCreateNewGraph: boolean): Promise<IMainGraphClassic> {
        return doRandomLayoutAdvancedFromGraph(this.graph, shouldCreateNewGraph);
    }

    graph: IGraphClassic;
    constraintContainer: ConstraintContainer;
}
