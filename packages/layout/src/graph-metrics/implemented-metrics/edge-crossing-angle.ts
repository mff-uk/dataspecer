
import { ReactflowDimensionsConstantEstimator } from "../../dimension-estimators/constant-dimension-estimator";
import { GraphClassic, IEdgeClassic, IGraphClassic } from "../../graph-iface";
import { AllMetricData, Metric } from "../graph-metrics-iface";
import { EdgeCrossingMetric } from "./edge-crossing";


// Generated by ChatGPT
// TODO RadStr: Maybe write simple test for this method (and for edge crossing) - just for the computation of that not the whole metric with graph, etc.
function calculateAngleBetweenVectors(a: number[], b: number[]): number {
  // Step 1: Calculate the dot product
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);

  // Step 2: Calculate the magnitudes of each vector
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai ** 2, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi ** 2, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error("Vectors must not be zero vectors.");
  }

  // Step 3: Calculate the cosine of the angle
  const cosTheta = dotProduct / (magnitudeA * magnitudeB);

  // Ensure the value is clamped to the valid range [-1, 1] to avoid NaN due to floating point errors
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));

  // Step 4: Calculate the angle in radians
  const angleRadians = Math.acos(clampedCosTheta);

  // Step 5: Convert radians to degrees
  const angleDegrees = angleRadians * (180 / Math.PI);
  const secondAngleDegrees = (360 - 2 * angleDegrees) / 2;
  // Choose the smaller of the 2 angles (the acute one), so the result is always in [0, 1] range
  return Math.min(angleDegrees, secondAngleDegrees);
}

function createVectorFromEdge(edge: IEdgeClassic) {
  const vector = [
    edge.end.completeVisualNode.coreVisualNode.position.x - edge.start.completeVisualNode.coreVisualNode.position.x,
    edge.end.completeVisualNode.coreVisualNode.position.y - edge.start.completeVisualNode.coreVisualNode.position.y,
  ];

  return vector;
}


export class EdgeCrossingAngleMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
      const idealAngle = 70;
      let crossCount = 0;
      let angleDifferenceSum = 0;
      for(let i = 0; i < graph.mainGraph.allEdges.length; i++) {
        for(let j = i; j < graph.mainGraph.allEdges.length; j++) {
          const edge1 = graph.mainGraph.allEdges[i];
          const edge2 = graph.mainGraph.allEdges[j];

          const vector1 = createVectorFromEdge(edge1);
          const vector2 = createVectorFromEdge(edge2);
          if((vector1[0] === 0 && vector1[1] === 0) || (vector2[0] === 0 && vector2[1] === 0)) {
            continue;
          }

          const areEdgesCrossing = EdgeCrossingMetric.isEdgeCrossForStraightLines(
            edge1.start.completeVisualNode, edge1.end.completeVisualNode,
            edge2.start.completeVisualNode, edge2.end.completeVisualNode);
          if(!areEdgesCrossing) {
            continue;
          }
          const angle = calculateAngleBetweenVectors(vector1, vector2);
          // https://github.com/rpgove/greadability
          angleDifferenceSum += Math.abs(idealAngle - angle);
          crossCount++;
        }
      }

      // Based on page 3 in https://osf.io/preprints/osf/wgzn5_v1
      const denominator = crossCount * idealAngle;
      if(denominator === 0) {
        return 1;
      }
      return 1 - (angleDifferenceSum / denominator);
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
