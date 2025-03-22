import { DefaultGraph, Graph } from "../../representation/graph";
import { getBotRightPosition, getTopLeftPosition } from "../../../util/utils";
import { AllMetricData, Metric } from "../graph-metric";

// Experimental
/**
 * Metric which computes the area the graph occupies
 */
export class AreaMetric implements Metric {
    computeMetric(graph: Graph): number {
        const nodes = Object.values(graph.nodes);
        const topLeft = getTopLeftPosition(nodes);
        const botRight = getBotRightPosition(nodes);

        let maxWidth = -100;
        let maxHeight = -100;
        nodes.forEach(node => {
            if(node.completeVisualNode.width > maxWidth) {
                maxWidth = node.completeVisualNode.width;
            }
            if(node.completeVisualNode.height > maxHeight) {
                maxHeight = node.completeVisualNode.height;
            }
        })
        let idealArea = Math.sqrt(nodes.length) * maxWidth + (Math.sqrt(nodes.length) - 1) * 200;
        idealArea *= Math.sqrt(nodes.length) * maxHeight + (Math.sqrt(nodes.length) - 1) * 200;

        let area = (botRight.x - topLeft.x) + (botRight.y - topLeft.y)
        area *= area;

        let areaMetric = area / idealArea;
        if(areaMetric > 1) {
            areaMetric = 1 / areaMetric;
        }

        // TODO RadStr: Debug
        console.info({areaMetric, area, idealArea});
        return areaMetric;
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
