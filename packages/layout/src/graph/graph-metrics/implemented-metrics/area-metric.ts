import { DefaultGraph, Graph } from "../../representation/graph.ts";
import { getBotRightPosition, getTopLeftPosition } from "../../../util/utils.ts";
import { AllMetricData, ComputedMetricValues, Metric } from "../graph-metric.ts";

// Experimental
/**
 * Metric which computes the area the graph occupies
 */
export class AreaMetric implements Metric {
    computeMetric(graph: Graph): ComputedMetricValues {
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
        return {
            absoluteValue: area,
            relativeValue: areaMetric
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
