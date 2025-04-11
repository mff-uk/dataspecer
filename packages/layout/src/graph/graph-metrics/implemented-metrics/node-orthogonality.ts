import { Graph } from "../../representation/graph";
import { VisualNodeComplete } from "../../representation/node";
import { AllMetricData, ComputedMetricValues, Metric } from "../graph-metric";

function areNodesAligned(
  node1: VisualNodeComplete,
  node2: VisualNodeComplete,
  alignmentLimit: number
): boolean {
  const pos1 = node1.coreVisualNode.position;
  const pos2 = node2.coreVisualNode.position;
  if(Math.abs(pos1.x - pos2.x) < alignmentLimit) {
    return true;
  }
  if(Math.abs(pos1.y - pos2.y) < alignmentLimit) {
    return true;
  }
  if(Math.abs((pos1.x - node1.width) - pos2.x) < alignmentLimit) {
    return true;
  }
  if(Math.abs((pos1.y - node1.height) - pos2.y) < alignmentLimit) {
    return true;
  }

  return false;
}


/**
 * Computes nearly orthogonal nodes
 */
export class NodeOrthogonalityMetric implements Metric {
    computeMetric(graph: Graph): ComputedMetricValues {
      const alignmentLimit = 20;      // TODO RadStr: Maybe try 0
      const nodes = Object.values(graph.nodes);
      const alreadyAligned: boolean[] = Array(nodes.length).fill(false);
      for (let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
          if(alreadyAligned[i] && alreadyAligned[j]) {
            continue;
          }
          const areAligned = areNodesAligned(
            nodes[i].completeVisualNode, nodes[j].completeVisualNode, alignmentLimit);
          // Alternatively here we could compute the number of aligned pairs instead:
          // alignedPairCount += areAligned ? 1 : 0;
          if(areAligned) {
            alreadyAligned[i] = true;
            alreadyAligned[j] = true;
          }
        }
      }

      console.info({alreadyAligned});
      console.info({nodes});

      const alignedCount = alreadyAligned.filter(isAligned => isAligned).length;
      return {
        absoluteValue: alignedCount,
        relativeValue: alignedCount / nodes.length,
      };
    }

    computeMetricForNodes(graph: Graph): Record<string, ComputedMetricValues> {
      throw new Error("Method not implemented.");
    }
    computeMetricForEdges(graph: Graph): Record<string, ComputedMetricValues> {
      throw new Error("Method not implemented.");
    }
    computeMetricsForEverything(graph: Graph): AllMetricData {
      throw new Error("Method not implemented.");
    }

}
