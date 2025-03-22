import { DefaultGraph, Graph } from "../../representation/graph";
import { VisualNodeComplete } from "../../representation/node";
import { AllMetricData, Metric } from "../graph-metric";

function areNodesAligned(
  node1: VisualNodeComplete,
  node2: VisualNodeComplete,
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


/**
 * Computes nearly orthogonal nodes TODO: Maybe I would compute nearly orthogonal and close to each other ... bu this just gets too complicated - how can I make that a number between [0, 1]?
 */
export class NodeOrthogonalityMetric implements Metric {
    computeMetric(graph: Graph): number {
      const alingmentLimit = 20;
      let alignedNodesCount = 0;      // TODO RadStr: PRobably remove this variable
      const nodes = Object.values(graph.nodes);
      const alreadyAligned: boolean[] = Array(nodes.length).fill(false);
      for (let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
          if(alreadyAligned[i] && alreadyAligned[j]) {
            continue;
          }
          const areAligned = areNodesAligned(
            nodes[i].completeVisualNode, nodes[j].completeVisualNode, alingmentLimit);
          alignedNodesCount += areAligned ? 1 : 0;
          if(areAligned) {
            alreadyAligned[i] = true;
            alreadyAligned[j] = true;
          }
        }
      }

      // return alignedNodesCount;    // TODO RadStr: Remove
      console.info({alreadyAligned});
      console.info({nodes});
      return alreadyAligned.filter(isAligned => isAligned).length / nodes.length;
    }

    computeMetricForNodes(graph: DefaultGraph): Record<string, number> {
      throw new Error("Method not implemented.");
    }
    computeMetricForEdges(graph: DefaultGraph): Record<string, number> {
      throw new Error("Method not implemented.");
    }
    computeMetricsForEverything(graph: DefaultGraph): AllMetricData {
      throw new Error("Method not implemented.");
    }

}
