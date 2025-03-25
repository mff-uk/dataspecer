import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { Position, VisualModel } from "@dataspecer/core-v2/visual-model";

import {
	UserGivenAlgorithmConfigurationslVersion4,
	AlgorithmConfiguration,
	GraphConversionConstraint,
} from "./configs/constraints";
import { DefaultGraph, MainGraph, VisualModelWithOutsiders } from "./graph/representation/graph";
import { ConstraintContainer } from "./configs/constraint-container";
import { Entities, Entity, EntityModel } from "@dataspecer/core-v2";
import { ConstraintFactory, SPECIFIC_ALGORITHM_CONVERSIONS_MAP } from "./configs/constraint-factories";
import { ReactflowDimensionsEstimator } from "./dimension-estimators/reactflow-dimension-estimator";
import type { LayoutedVisualEntities, VisualEntitiesWithModelVisualInformation } from "./migration-to-cme-v2";
export { type LayoutedVisualEntities } from "./migration-to-cme-v2";
export type { VisualEntitiesWithModelVisualInformation };
import { EdgeCrossingMetric } from "./graph/graph-metrics/implemented-metrics/edge-crossing";
import { EdgeNodeCrossingMetric } from "./graph/graph-metrics/implemented-metrics/edge-node-crossing";

export type {
	UserGivenAlgorithmConfigurationslVersion4 as UserGivenConstraintsVersion4
} from "./configs/constraints";
export {
	getDefaultUserGivenAlgorithmConstraint,
	getDefaultMainUserGivenAlgorithmConstraint,
	getDefaultUserGivenConstraintsVersion4
} from "./configs/constraints";

import { Direction } from "./util/utils";
export { Direction };

export { ReactflowDimensionsEstimator };
export { ReactflowDimensionsConstantEstimator } from "./dimension-estimators/constant-dimension-estimator";

import type { EdgeRouting } from "./configs/constraints";
export type { EdgeRouting };

import { placeCoordinateOnGrid, placePositionOnGrid } from "./util/utils";
import { ExplicitAnchors } from "./explicit-anchors";
import { AreaMetric } from "./graph/graph-metrics/implemented-metrics/area-metric";
import { NodeOrthogonalityMetric } from "./graph/graph-metrics/implemented-metrics/node-orthogonality";
import { EdgeCrossingAngleMetric } from "./graph/graph-metrics/implemented-metrics/edge-crossing-angle";
import { Metric } from "./graph/graph-metrics/graph-metric";
import { GraphAlgorithms } from "./graph-algoritms";
import { Node } from "./graph/representation/node";
export { type Node };
import { GraphFactory } from "./graph/representation/graph-factory";
import { ALGORITHM_NAME_TO_LAYOUT_MAPPING, AlgorithmName } from "./layout-algorithms/list-of-layout-algorithms";
import { LayoutAlgorithm } from "./layout-algorithms/layout-algorithms-interfaces";
export type { AlgorithmName };
export { AnchorOverrideSetting } from "./explicit-anchors";
export { placeCoordinateOnGrid, placePositionOnGrid };

export { type ExplicitAnchors } from "./explicit-anchors";
export { type VisualModelWithOutsiders } from "./graph/representation/graph";

export type {
	UserGivenAlgorithmConfiguration,
	UserGivenAlgorithmConfigurationElkForce,
	UserGivenAlgorithmConfigurationExtraData,
	UserGivenAlgorithmConfigurationForGeneralization,
	UserGivenAlgorithmConfigurationLayered,
	UserGivenAlgorithmConfigurationStress,
	UserGivenAlgorithmConfigurationOnlyData,
} from "./configs/constraints";

export { type ElkForceAlgType } from "./configs/elk/elk-constraints";

/**
 * The object (class) implementing this interface handles the act of getting width and height of given node. The act has to be separated from the reactflow visualization library,
 * because either the library may be switched for some other (highly unlikely from my point of view), but more importantly the layouting may be performed outside the diagram/editor.
 * component, so there has to be other way(s) to get the width and height of nodes needed for layouting.
 * For such case the implemented variants are (so far) {@link ReactflowDimensionsEstimator} and {@link ReactflowDimensionsConstantEstimator}.
 */
export interface NodeDimensionQueryHandler {
	getWidth(node: Node);
	getHeight(node: Node);
}

export type XY = Omit<Position, "anchored">;

// The layout works like this. The layout package gets configuration from user, usually inserted through dialog.
// This configuration is converted to different set of constraints, this looked like over-engineering at first, but actually after working with it a bit, while
// programming my own algorithm, it is quite flexible.
// There are different set of constraints:
// 1) Actions which should be performed before we start the layouting. Meaning layouting in sense that we enter the loop which runs the algorithm 1 or more times to find the best layout.
// 2) Then actions which should be performed in the loop (For example run random layout, followed by stress layout, followed by layered algorithm)
// The actions in 1) and 2) are either GraphConversionConstraint or AlgorithmConfiguration, depending on the type of action
// But that isn't all, we also have pre- and post- conditions, which are special actions which should be performed before, respectively after the steps 1), 2)
// There are currntly no pre- and post- conditions, so it may make sense to remove that part of code - TODO:




/**
 * Contains the visual entities (that is entities present in visual model). Those contain also the relevant edges
 *
 * And outsiders - which represent classes or class profiles, which are not in the visual model.
 * We don't pass the edges (relationships, generalizations, ...) to outsiders, since we expect
 * that we want to have all edges connected to those class/class profiles inside the layouting graph.
 */
export type VisualEntitiesWithOutsiders = {
	visualEntities: string[],
	outsiders: Record<string, XY | null>;
};

export async function performLayout(
	visualModel: VisualModel,
	semanticModels: Map<string, EntityModel>,
	entitiesToLayout: VisualEntitiesWithOutsiders,
	config: UserGivenAlgorithmConfigurationslVersion4,
	nodeDimensionQueryHandler?: NodeDimensionQueryHandler,
	explicitAnchors?: ExplicitAnchors
): Promise<LayoutedVisualEntities> {
	console.log("config");
	console.log(config);

	const visualEntitiesPromise = performLayoutInternal(visualModel, semanticModels, entitiesToLayout, config, nodeDimensionQueryHandler, explicitAnchors);
	return visualEntitiesPromise;
}


// TODO PRQuestion: Maybe just return VisualEntities - so without the information about entity being an outsider
//                  On one side, I have the info in nice format so why shouldn't I give it out
//                  On other side, the caller should know about the outsiders, and the API - especially here should be probably minimal
/**
 * Layout given visual model.
 * @param visualModel The visual model to perform layout on.
 * @param semanticModels
 * @param config
 * @param nodeDimensionQueryHandler
 * @param explicitAnchors If this is undefined then use the anchors of visual model, otherwise it depends on the given anchors' settings.
 * @returns Promise with new positions of the visual entities.
 */
export async function performLayoutOfVisualModel(
	visualModel: VisualModelWithOutsiders,
	semanticModels: Map<string, EntityModel>,
	config: UserGivenAlgorithmConfigurationslVersion4,
	nodeDimensionQueryHandler?: NodeDimensionQueryHandler,
	explicitAnchors?: ExplicitAnchors
): Promise<LayoutedVisualEntities> {
	console.log("config");
	console.log(config);

	const entitiesToLayout: VisualEntitiesWithOutsiders = {
		visualEntities: [...visualModel.visualModel.getVisualEntities().keys()],
		outsiders: visualModel.outsiders
	};

	const visualEntitiesPromise = performLayoutInternal(visualModel.visualModel, semanticModels, entitiesToLayout, config, nodeDimensionQueryHandler, explicitAnchors);
	return visualEntitiesPromise;
}


/**
 * Layout given semantic model.
 */
export async function performLayoutOfSemanticModel(
	inputSemanticModel: Record<string, SemanticModelEntity>,
	semanticModelId: string,
	config: UserGivenAlgorithmConfigurationslVersion4,
	nodeDimensionQueryHandler?: NodeDimensionQueryHandler
): Promise<LayoutedVisualEntities> {
	// If we want to layout more than one, then just change the arguments and fill the semanticModels variable in loop.

	const entityModelUsedForConversion: EntityModel = {
		getEntities: function (): Entities {
			return inputSemanticModel;
		},
		subscribeToChanges: function (callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void {
			throw new Error("Function not implemented.");
		},
		getId: function (): string {
			throw new Error("Function not implemented.");
		},
		getAlias: function (): string | null {
			throw new Error("Function not implemented.");
		},
		setAlias: function (alias: string | null): void {
			throw new Error("Function not implemented.");
		}
	};
	const semanticModels: Map<string, EntityModel> = new Map();
	semanticModels.set(semanticModelId, entityModelUsedForConversion);

	const outsiders: Record<string, XY | null> = {}
	Object.keys([...semanticModels.values()][0].getEntities()).forEach(identifier => {
		outsiders[identifier] = null;
	});
	const entitiesToLayout: VisualEntitiesWithOutsiders = {
		visualEntities: [],
		outsiders,
	};

	const visualEntitiesPromise = performLayoutInternal(null, semanticModels, entitiesToLayout, config, nodeDimensionQueryHandler);
	return visualEntitiesPromise;
}


function performLayoutInternal(
	visualModel: VisualModel,
	semanticModels: Map<string, EntityModel>,
	entitiesToLayout: VisualEntitiesWithOutsiders,
	config: UserGivenAlgorithmConfigurationslVersion4,
	nodeDimensionQueryHandler?: NodeDimensionQueryHandler,
	explicitAnchors?: ExplicitAnchors
): Promise<LayoutedVisualEntities> {
	const graph = GraphFactory.createMainGraph(null, semanticModels, visualModel, entitiesToLayout, nodeDimensionQueryHandler, explicitAnchors);
	const visualEntitiesPromise = performLayoutFromGraph(graph, config).then(async (resultAggregations) => {
		const resultingGraph = await getBestLayoutFromMetricResultAggregation(resultAggregations);
		return resultingGraph.convertWholeGraphToDataspecerRepresentation();
	});

	if(visualEntitiesPromise == undefined) {
		console.log("LAYOUT FAILED")
		throw new Error("Layout Failed");
	}


	return visualEntitiesPromise;
}


/**
 * Layout given graph based on given layout configuration
 */
export async function performLayoutFromGraph(
	graph: MainGraph,
	config: UserGivenAlgorithmConfigurationslVersion4
): Promise<Record<string, MetricResultsAggregation>> {
	const constraints = ConstraintFactory.createConstraints(config);

	const resultingAggregationsPromise = performLayoutingBasedOnConstraints(graph, constraints);

	// TODO: DEBUG
	// console.log("THE END");
	// throw new Error("THE END");

	return resultingAggregationsPromise;
}


/**
 * Performs all relevant layout operations based on given constraints
 */
const performLayoutingBasedOnConstraints = async (
	graph: MainGraph,
	constraints: ConstraintContainer
): Promise<Record<string, MetricResultsAggregation>> => {
	let workGraph = graph;
	for(const action of constraints.layoutActionsIteratorBefore) {
		if(action instanceof GraphConversionConstraint) {
			SPECIFIC_ALGORITHM_CONVERSIONS_MAP[action.actionName](action, workGraph);
		}
		else if(action instanceof AlgorithmConfiguration) {		// TODO: Using the actual type instead of interface
			const layoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[action.algorithmName];
			if(action.algorithmPhasesToCall === "ONLY-PREPARE" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
				layoutAlgorithm.prepareFromGraph(workGraph, constraints);
			}
			if(action.algorithmPhasesToCall === "ONLY-RUN" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
				if(action.constraintedNodes === "GENERALIZATION") {
					workGraph = await layoutAlgorithm.runGeneralizationLayout(action.shouldCreateNewGraph);
				}
				else {
					workGraph = await layoutAlgorithm.run(action.shouldCreateNewGraph);
				}
			}
		}
	}

	return runMainLayoutAlgorithm(workGraph, constraints).then(aggregationResult => {
		return aggregationResult;
	});

}

/**
 * Run the main layouting algorithm for the given graph. TODO: Well it is not just the main, there may be layerify after, etc.
 */
const runMainLayoutAlgorithm = async (
	graph: MainGraph,
	constraints: ConstraintContainer
): Promise<Record<string, MetricResultsAggregation>> => {
	const metricsWithWeights: MetricWithWeight[] = [
		{
			name: "EdgeCrossingMetric",
			metric: new EdgeCrossingMetric(),
			weight: 1
		},
		{
			name: "EdgeCrossingAngleMetric",
			metric: new EdgeCrossingAngleMetric(),
			weight: 0
		},
		{
			name: "EdgeNodeCrossingMetric",
			metric: new EdgeNodeCrossingMetric(),
			weight: 20
		},
		{
			name: "AreaMetric",
			metric: new AreaMetric(),
			weight: 0
		},
		{
			name: "NodeOrthogonalityMetric",
			metric: new NodeOrthogonalityMetric(),
			weight: 0.0
		},
	];
	const computedMetricsData = createObjectsToHoldMetricsData(metricsWithWeights);
	const numberOfAlgorithmRuns = constraints.numberOfAlgorithmRuns;


	for(let i = 0; i < numberOfAlgorithmRuns; i++) {
		let workGraph = graph;		// TODO: Maybe create copy?
		let layoutedGraphPromise: Promise<MainGraph>;
		for(const action of constraints.layoutActionsIterator) {
			if(action instanceof GraphConversionConstraint) {
				layoutedGraphPromise = SPECIFIC_ALGORITHM_CONVERSIONS_MAP[action.actionName](action, workGraph);
				workGraph = await layoutedGraphPromise;
			}
			else if(action instanceof AlgorithmConfiguration) {		// TODO: Using the actual type instead of interface
				const layoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[action.algorithmName];
				if(action.algorithmPhasesToCall === "ONLY-PREPARE" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
					console.info("workGraph", {...workGraph});
					layoutAlgorithm.prepareFromGraph(workGraph, constraints);
				}
				if(action.algorithmPhasesToCall === "ONLY-RUN" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
					if(action.constraintedNodes === "ALL") {
						layoutedGraphPromise = layoutAlgorithm.run(action.shouldCreateNewGraph);
						workGraph = await layoutedGraphPromise;
					}
					else if(action.constraintedNodes === "GENERALIZATION") {
						layoutedGraphPromise = layoutAlgorithm.runGeneralizationLayout(action.shouldCreateNewGraph);
						workGraph = await layoutedGraphPromise;
					}
				}
			}
		}

		// const visualEntities = layoutedGraph.convertWholeGraphToDataspecerRepresentation();
		// console.log(visualEntities);

		performMetricsComputation(
			metricsWithWeights, computedMetricsData.metricResults,
			computedMetricsData.metricResultAggregations,
			workGraph, layoutedGraphPromise);
		constraints.resetLayoutActionsIterator();
	}

	for(const key of Object.keys(computedMetricsData.metricResultAggregations)) {
		computedMetricsData.metricResultAggregations[key].avg /= numberOfAlgorithmRuns;
	}
	console.log("Metrics aggregations result: ", computedMetricsData.metricResultAggregations);
	console.log("Metrics all results: ", computedMetricsData.metricResults);
	console.log(await computedMetricsData.metricResultAggregations["total"].max.graphPromise);
	GraphAlgorithms.moveTestEdgeLenOneUp();			// TODO RadStr: DEBUG ... just remove
	return computedMetricsData.metricResultAggregations;
}

type MetricWithWeight = {
	name: string,
	metric: Metric,
	weight: number
}

type MetricResultsAggregation = {
	avg: number,
	min: MetricWithGraphPromise | null,
	max: MetricWithGraphPromise | null,
}

type MetricWithGraphPromise = {
	value: number,
	graphPromise: Promise<MainGraph>
}

function createObjectsToHoldMetricsData(metrics: MetricWithWeight[]) {
	const metricResultAggregations: Record<string, MetricResultsAggregation> = {};
	metrics
		.forEach(metric => metricResultAggregations[metric.name] = {
			avg: 0,
			min: {
				value: 10000000,
				graphPromise: null
			},
			max: {
				value: -10000000,
				graphPromise: null
			},
		});
		metricResultAggregations["total"] = {
			avg: 0,
			min: {
				value: 10000000,
				graphPromise: null
			},
			max: {
				value: -10000000,
				graphPromise: null
			},
		};

	const metricResults: Record<string, number[]> = {};
	metrics.forEach(metric => metricResults[metric.name] = []);
	metricResults["total"] = [];

		return {
			metricResultAggregations,
			metricResults
		};
}

export function getBestLayoutFromMetricResultAggregation(
	metricResultAggregations: Record<string, MetricResultsAggregation>
): Promise<MainGraph> {
	const resultingGraph = metricResultAggregations["total"].max.graphPromise;
	return resultingGraph;
}

export function getBestMetricResultAggregation(
	metricResultAggregations: Record<string, MetricResultsAggregation>
): MetricWithGraphPromise {
	const best = metricResultAggregations["total"].max;
	return best;
}

function performMetricsComputation(
	metricsToCompute: MetricWithWeight[],
	computedMetricsFromPreviousIterations: Record<string, number[]>,
	metricResultsAggregation: Record<string, MetricResultsAggregation>,
	graph: MainGraph,
	layoutedGraphPromise: Promise<MainGraph>,
) {
	const computedMetrics = [];
	for(const metricToCompute of metricsToCompute) {
		const computedMetric = metricToCompute.metric.computeMetric(graph as unknown as DefaultGraph);		// TODO RadStr: Fix the typing
		computedMetricsFromPreviousIterations[metricToCompute.name].push(computedMetric);
		computedMetrics.push(computedMetric);

		setMetricResultsAggregation(metricResultsAggregation, metricToCompute.name, computedMetric, layoutedGraphPromise);
	}

	let absoluteMetric = 0;
	for(let i = 0; i < computedMetrics.length; i++) {
		absoluteMetric += metricsToCompute[i].weight * computedMetrics[i];
	}

	computedMetricsFromPreviousIterations["total"].push(absoluteMetric);
	setMetricResultsAggregation(metricResultsAggregation, "total", absoluteMetric, layoutedGraphPromise);
}

function setMetricResultsAggregation(
	metricResultsAggregation: Record<string, MetricResultsAggregation>,
	key: string,
	computedMetric: number,
	layoutedGraphPromise: Promise<MainGraph>,
) {
	metricResultsAggregation[key].avg += computedMetric;
	if(metricResultsAggregation[key].min.value > computedMetric) {
		metricResultsAggregation[key].min = {
			value: computedMetric,
			graphPromise: layoutedGraphPromise
		};
	}
	if(metricResultsAggregation[key].max.value < computedMetric) {
		metricResultsAggregation[key].max = {
			value: computedMetric,
			graphPromise: layoutedGraphPromise
		};
	}
}
