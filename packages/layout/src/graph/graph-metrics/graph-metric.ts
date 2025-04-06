import { DefaultGraph } from "../representation/graph";

export type ComputedMetricValues = {
    /**
     * The absolute value for the metric - for example number of crossings, etc.
     */
    absoluteValue: number,
    /**
     * Relative value between [0, 1], 1 being the best.
     */
    relativeValue: number,
}

/**
 * Represents graph metric
 */
export interface Metric {

    /**
     * Computes the implemented metric for given graph. Metric is usually a number in range [0, 1]
     * @param graph
     */
    computeMetric(graph: DefaultGraph): ComputedMetricValues,


    /**
     * Computes metric for each node. This shows how much each node satisfies implemented metric in the context of whole graph
     * @param graph
     */
    computeMetricForNodes(graph: DefaultGraph): Record<string, ComputedMetricValues>,


    /**
     * Same as {@link computeMetricForNodes}, but for edges
     * @param graph
     */
    computeMetricForEdges(graph: DefaultGraph): Record<string, ComputedMetricValues>,


    /**
     * Runs all the other methods of {@link Metric} interface for given graph
     */
    computeMetricsForEverything(graph: DefaultGraph): AllMetricData,
}

export interface AllMetricData {
    metricForWholeGraph: number,
    metricsForNodes: Record<string, ComputedMetricValues>,
    metricsForEdges: Record<string, ComputedMetricValues>,
}
