import { GraphClassic, INodeClassic } from "../graph-iface.ts";

/**
 * Represents graph metric
 */
export interface Metric {


    /**
     * Computes the implemented metric for given graph. Metric is usually a number in range [0, 1]
     * @param graph
     */
    computeMetric(graph: GraphClassic): number,


    /**
     * Computes metric for each node. This shows how much each node satisfies implemented metric in the context of whole graph
     * @param graph
     */
    computeMetricForNodes(graph: GraphClassic): Record<string, number>,


    /**
     * Same as {@link computeMetricForNodes}, but for edges
     * @param graph
     */
    computeMetricForEdges(graph: GraphClassic): Record<string, number>,


    /**
     * Runs all the other methods of {@link Metric} interface for given graph
     */
    computeMetricsForEverything(graph: GraphClassic): AllMetricData,
}

export interface AllMetricData {
    metricForWholeGraph: number,
    metricsForNodes: Record<string, number>,
    metricsForEdges: Record<string, number>,
}
