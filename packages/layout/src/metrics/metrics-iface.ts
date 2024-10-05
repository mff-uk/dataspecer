import { GraphClassic, INodeClassic } from "../graph-iface";

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
    // TODO: Well I will have to represent the edges as objects anyways in layouting v3
    // TODO: I am not sure how I should actually represent the edges (both the name and the ends itself)
    // The name should be the identifier
    // The ends should either be looked up or can be represented in class through: a) string - sourceClassName-targetClassName
    // b) s-t as fields
    // TODO: Should I have another place where I have list of all the edges so I don't have to look to the nodes to find it??
    // If I have list then I can refer using indices to the array instead of names, etc.
    metricsForEdges: Record<string, number>,
}