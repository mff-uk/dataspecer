import { GraphClassic, IGraphClassic, IVisualNodeComplete } from "../../graph-iface";
import { AllMetricData, Metric } from "../graph-metrics-iface";

function areNodesAligned(
  node1: IVisualNodeComplete,
  node2: IVisualNodeComplete,
  alingmentLimit: number
): boolean {
  const pos1 = node1.coreVisualNode.position;
  const pos2 = node2.coreVisualNode.position;
  if(Math.abs(pos1.x - pos2.x) < alingmentLimit) {
    return true;
  }
  if(Math.abs(pos1.y - pos2.y) < alingmentLimit) {
    return true;
  }
  if(Math.abs((pos1.x - node1.width) - pos2.x) < alingmentLimit) {
    return true;
  }
  if(Math.abs((pos1.y - node1.height) - pos2.y) < alingmentLimit) {
    return true;
  }


  return false;
}

export class NodeOrthogonalityMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
      const alingmentLimit = 50;
      let alignedNodesCount = 0;
      const nodes = Object.values(graph.nodes);
      for (let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
          const areAligned = areNodesAligned(
            nodes[i].completeVisualNode, nodes[j].completeVisualNode, alingmentLimit);
          alignedNodesCount += areAligned ? 1 : 0;
        }
      }

      return alignedNodesCount;
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
