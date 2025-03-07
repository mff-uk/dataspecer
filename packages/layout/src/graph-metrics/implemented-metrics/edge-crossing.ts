import { Position } from "@dataspecer/core-v2/visual-model";
import { GraphClassic, IGraphClassic, IVisualNodeComplete } from "../../graph-iface";
import { AllMetricData, Metric } from "../graph-metrics-iface";
import { findNodeBorder } from "../../util/utils";
import { XY } from "../..";

export class EdgeCrossingMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
        let edgeCrossingCount: number = 0;
        Object.values(graph.nodes).forEach(sourceNode1 => {
            for(let edge1 of sourceNode1.getAllOutgoingEdges()) {
                Object.values(graph.nodes).forEach(sourceNode2 => {
                    if(sourceNode1 === sourceNode2) {
                        return;
                    }
                    for(let edge2 of sourceNode2.getAllOutgoingEdges()) {
                        if(edge1.start === edge2.end && edge1.end === edge2.start) {        // Comparing A -> B and B -> A
                            continue;
                        }

                        edgeCrossingCount += EdgeCrossingMetric.isEdgeCrossForStraightLines(edge1.start.completeVisualNode, edge1.end.completeVisualNode,
                                                                                            edge2.start.completeVisualNode, edge2.end.completeVisualNode);
                    }
                }
                )
            }
        });
        return edgeCrossingCount / 2;
    }

    // Based on https://stackoverflow.com/questions/3838329/how-can-i-check-if-two-segments-intersect
    /**
     *
     * @returns 1 for edge crossing, 0 for no edge crossing
     */
    public static isEdgeCrossForStraightLines(source1: IVisualNodeComplete, target1: IVisualNodeComplete,
                                              source2: IVisualNodeComplete, target2: IVisualNodeComplete): 0 | 1 {
        const a = findNodeBorder(source1, EdgeCrossingMetric.getMiddle(target1));
        const b = findNodeBorder(target1, EdgeCrossingMetric.getMiddle(source1));
        const c = findNodeBorder(source2, EdgeCrossingMetric.getMiddle(target2));
        const d = findNodeBorder(target2, EdgeCrossingMetric.getMiddle(source2));
        return EdgeCrossingMetric.isCounterClockwise(a, c, d) != EdgeCrossingMetric.isCounterClockwise(b, c, d) &&
                EdgeCrossingMetric.isCounterClockwise(a, b, c) != EdgeCrossingMetric.isCounterClockwise(a, b, d) ? 1 : 0;
    }

    public static getMiddle(completeVisualNode: IVisualNodeComplete): Position {
        return {
            x: completeVisualNode.coreVisualNode.position.x + completeVisualNode.width / 2,
            y: completeVisualNode.coreVisualNode.position.y + completeVisualNode.height / 2,
            anchored: null,
        };
    }

    public static isCounterClockwise(a: Position | XY, b: Position | XY, c: Position | XY): boolean {
        return (c.y-a.y)*(b.x-a.x) > (b.y-a.y)*(c.x-a.x);
    }

    computeMetricForNodes(graph: GraphClassic): Record<string, number> {
        throw new Error("Method not implemented.");
    }
    computeMetricForEdges(graph: GraphClassic): Record<string, number> {
        throw new Error("Method not implemented.");
    }
    computeMetricsForEverything(graph: GraphClassic): AllMetricData {
        throw new Error("Method not implemented.");
    }

}
