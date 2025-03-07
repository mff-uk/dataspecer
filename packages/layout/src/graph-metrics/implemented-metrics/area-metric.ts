import { GraphClassic, IGraphClassic } from "../../graph-iface";
import { getBotRightPosition, getTopLeftPosition } from "../../util/utils";
import { AllMetricData, Metric } from "../graph-metrics-iface";

export class AreaMetric implements Metric {
    computeMetric(graph: IGraphClassic): number {
        const topLeft = getTopLeftPosition(Object.values(graph.nodes));
        const botRight = getBotRightPosition(Object.values(graph.nodes));
        const area = (botRight.x - topLeft.x) + (botRight.y - topLeft.y)
        return area * area;
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
