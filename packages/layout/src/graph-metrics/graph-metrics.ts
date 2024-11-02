import { VisualEntity } from "@dataspecer/core-v2/visual-model";
import { GraphClassic, IGraphClassic, IVisualNodeComplete } from "../graph-iface";
import { AllMetricData, Metric } from "./graph-metrics-iface";
import { Position } from "../../../core-v2/lib/visual-model/visual-entity";

export class EdgeCrossingMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
        let edgeCrossingCount: number = 0;
        Object.values(graph.nodes).forEach(n => {
            for(let outN of n.getAllOutgoingEdges()) {
                Object.values(graph.nodes).forEach(nn => {
                    if(n === nn) {
                        return;
                    }
                    for(let outNN of nn.getAllOutgoingEdges()) {
                        // TODO: Have to fix, but currently we set only the positions of the entities which are part of the visual model and not the dummy ones
                        //       (for example generalization subgraphs)
                        if(n.completeVisualNode === undefined || nn.completeVisualNode === undefined) {
                            continue;
                        }

                        edgeCrossingCount += EdgeCrossingMetric.isEdgeCrossForStraightLines(n.completeVisualNode, outN.end.completeVisualNode,
                                                                                            nn.completeVisualNode, outNN.end.completeVisualNode);
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
        const a = EdgeCrossingMetric.getMiddle(source1);
        const b = EdgeCrossingMetric.getMiddle(target1);
        const c = EdgeCrossingMetric.getMiddle(source2);
        const d = EdgeCrossingMetric.getMiddle(target2);
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

    public static isCounterClockwise(a: Position, b: Position, c: Position): boolean {
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

// https://i11www.iti.kit.edu/_media/teaching/theses/graphstudy-final.pdf - Page 33
// (RDF_GLOBAL)
// class NodeDistanceDistributionMatrix implements Metric {

// }

// class CrossingAngleMetric implements Metric {

// }

// class NodeOrthogonalityMetric implements Metric {

// }

// class EdgeOrthogonalityMetric implements Metric {

// }

// class SymmetryMetric implements Metric {

// }

// class EdgeAngleMetric implements Metric {

// }

// class AreaMetric implements Metric {

// }

// class ClusterMetric implements Metric {

// }

// class EdgeBendMetric implements Metric {

// }

// // TODO: This makes sense if we just keep the 2 (4) ports
// class EdgePortMetric implements Metric {

// }

// class MainEntityMetric implements Metric {

// }

// class LongestEdgeMetric implements Metric {

// }

// class AverageEdgeLengthMetric implements Metric {

// }

// class EvenDistributionOfVertices implements Metric {

// }

// class AnglesBetweenEachVertexPairUsedForDynamicLayout implements Metric {

// }

// class RelativePositionOfNOdesChangeUsedForDynamicLayout implements Metric {

// }

// class LambdaModelUsedForDynamicLayout implements Metric {

// }

// class ClusteringMetricsForUsedForDynamicLayout implements Metric {

// }
// class ClusteringMetricMinDistanceNeighborCountForDynamicLayout implements Metric {

// }
// class ClusteringMetricMinDistanceNeighborWeightedForDynamicLayout implements Metric {

// }
// class ClusteringMetricNearestNeighborBetweenForDynamicLayout implements Metric {

// }
// class ClusteringMetricNearestNeighborBetweenWeightedForDynamicLayout implements Metric {

// }

// TODO:
// class ClusteringWithTwoCreatedSubgraphsWithSameNodesButEdgesBasedOnProximityForDynamicLayout implements Metric {

// }


// TODO: Came up with it it now - basically like clusters, but measures how lousy are some places in graph - either edge wise or node wise
//       (close to each other, a lot of crossings)
// class DensityMetric implements Metric {

// }