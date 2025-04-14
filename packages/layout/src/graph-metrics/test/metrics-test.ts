import { NodeDimensionQueryHandler } from "../../index.ts";
import { IMainGraphClassic } from "../../graph-iface.ts";
import { EdgeCrossingMetric } from "../implemented-metrics/edge-crossing.ts";
import { EdgeNodeCrossingMetric } from "../implemented-metrics/edge-node-crossing.ts";

// TODO: The metrics here works, I just extracted the test code here in case if I need some tests in future to proof that it works even if I tested it manually.
function testMetrics(graph: IMainGraphClassic, nodeDimensionQueryHandler: NodeDimensionQueryHandler) {
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
