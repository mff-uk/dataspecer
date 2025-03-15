import { NodeDimensionQueryHandler } from "../../..";
import { MainGraph } from "../../representation/graph";
import { EdgeCrossingMetric } from "../implemented-metrics/edge-crossing";
import { EdgeNodeCrossingMetric } from "../implemented-metrics/edge-node-crossing";

// TODO: The metrics here works, I just extracted the test code here in case if I need some tests in future to proof that it works even if I tested it manually.
function testMetrics(graph: MainGraph, nodeDimensionQueryHandler: NodeDimensionQueryHandler) {
    graph.allNodes.forEach(n => {
		n.completeVisualNode.width = nodeDimensionQueryHandler.getWidth(n);
		n.completeVisualNode.height = nodeDimensionQueryHandler.getHeight(n);
	});


	const edgeCrossingMetric: EdgeCrossingMetric = new EdgeCrossingMetric();
	const edgeNodeCrossingMetric: EdgeNodeCrossingMetric = new EdgeNodeCrossingMetric();
	const edgeCrossCountForCurrent = edgeCrossingMetric.computeMetric(graph);
	const edgeNodeCrossCountForCurrent = edgeNodeCrossingMetric.computeMetric(graph);
	const absoluteMetricForCurrent = edgeCrossCountForCurrent + edgeNodeCrossCountForCurrent;

	console.log("Edge cross count: " + edgeCrossCountForCurrent);
	console.log("Edge node cross count: " + edgeNodeCrossCountForCurrent);
	console.log("Metric total: " + absoluteMetricForCurrent);
}
