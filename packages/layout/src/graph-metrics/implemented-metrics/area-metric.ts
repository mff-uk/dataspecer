import { GraphClassic, IGraphClassic } from "../../graph-iface";
import { getBotRightPosition, getTopLeftPosition } from "../../util/utils";
import { AllMetricData, Metric } from "../graph-metrics-iface";

// Experimental
export class AreaMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
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
