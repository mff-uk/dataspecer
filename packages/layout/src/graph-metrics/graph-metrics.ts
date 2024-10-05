import { VisualEntity } from "@dataspecer/core-v2/visual-model";
import { GraphClassic, IVisualEntityComplete } from "../graph-iface";
import { AllMetricData, Metric } from "./graph-metrics-iface";
import { Position } from "../../../core-v2/lib/visual-model/visual-entity";

export class EdgeCrossingMetric implements Metric {
    computeMetric(graph: GraphClassic): number {
        let edgeCrossingCount: number = 0;
        Object.values(graph.nodes).forEach(n => {
            for(let outN of n.getAllOutgoingEdges()) {
                Object.values(graph.nodes).forEach(nn => {
                    if(n === nn) {
                        return;
                    }
                    for(let outNN of nn.getAllOutgoingEdges()) {
                        edgeCrossingCount += EdgeCrossingMetric.isEdgeCrossForStraightLines(n.completeVisualEntity, outN.completeVisualEntity,
                                                                                            nn.completeVisualEntity, outNN.completeVisualEntity);
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
     * @param source1
     * @param target1
     * @param source2
     * @param target2
     * @returns 1 for edge crossing, 0 for no edge crossing
     */
    public static isEdgeCrossForStraightLines(source1: IVisualEntityComplete, target1: IVisualEntityComplete,
                                              source2: IVisualEntityComplete, target2: IVisualEntityComplete): 0 | 1 {
        const a = source1.coreVisualEntity.position;
        const b = target1.coreVisualEntity.position;
        const c = source2.coreVisualEntity.position;
        const d = target2.coreVisualEntity.position;
        return EdgeCrossingMetric.isCounterClockwise(a, c, d) != EdgeCrossingMetric.isCounterClockwise(b, c, d) &&
                EdgeCrossingMetric.isCounterClockwise(a, b, c) != EdgeCrossingMetric.isCounterClockwise(a, b, d) ? 1 : 0;
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