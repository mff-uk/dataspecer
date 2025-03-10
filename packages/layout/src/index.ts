import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { Position, VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
import { ExtractedModels, LayoutAlgorithm, LayoutMethod, extractModelObjects } from "./layout-iface";

import {
	UserGivenConstraints,
	UserGivenAlgorithmConfigurationslVersion2,
	ConstraintTime,
	IConstraint,
	IConstraintSimple,
	getDefaultUserGivenConstraintsVersion2,
	UserGivenAlgorithmConfigurationslVersion4,
	getDefaultUserGivenAlgorithmConstraint,
	AlgorithmConfiguration,
	getDefaultMainUserGivenAlgorithmConstraint,
	getDefaultUserGivenConstraintsVersion4,
	GraphConversionConstraint,
	IAlgorithmConfiguration,
} from "./configs/constraints";
import { GraphClassic, GraphFactory, IGraphClassic, IMainGraphClassic, INodeClassic, MainGraphClassic, VisualModelWithOutsiders, VisualNodeComplete } from "./graph-iface";
import { ConstraintContainer, ALGORITHM_NAME_TO_LAYOUT_MAPPING } from "./configs/constraint-container";
import { Entities, Entity, EntityModel } from "@dataspecer/core-v2";
import { ConstraintFactory, SPECIFIC_ALGORITHM_CONVERSIONS_MAP } from "./configs/constraint-factories";
import { ReactflowDimensionsEstimator } from "./dimension-estimators/reactflow-dimension-estimator";
import { PhantomElementsFactory } from "./util/utils";
import { CONSTRAINT_MAP } from "./configs/constraints-mapping";
import type { LayoutedVisualEntities, VisualEntitiesWithModelVisualInformation } from "./migration-to-cme-v2";
export { type LayoutedVisualEntities } from "./migration-to-cme-v2";
export type { VisualEntitiesWithModelVisualInformation };
import { EdgeCrossingMetric } from "./graph-metrics/implemented-metrics/edge-crossing";
import { EdgeNodeCrossingMetric } from "./graph-metrics/implemented-metrics/edge-node-crossing";

export type { IConstraintSimple, UserGivenConstraints, UserGivenAlgorithmConfigurationslVersion2 as UserGivenConstraintsVersion2, UserGivenAlgorithmConfigurationslVersion4 as UserGivenConstraintsVersion4 } from "./configs/constraints";
export { getDefaultUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion2, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4 } from "./configs/constraints";
export type { AlgorithmName } from "./configs/constraint-container";

import { Direction } from "./util/utils";
export { Direction };
export type { INodeClassic } from "./graph-iface";

export { ReactflowDimensionsEstimator };
export { ReactflowDimensionsConstantEstimator } from "./dimension-estimators/constant-dimension-estimator";

import type { EdgeRouting } from "./configs/constraints";
export type { EdgeRouting };

import { placePositionOnGrid } from "./util/utils";
import { ExplicitAnchors } from "./explicit-anchors";
import { AreaMetric } from "./graph-metrics/implemented-metrics/area-metric";
import { NodeOrthogonalityMetric } from "./graph-metrics/implemented-metrics/node-orthogonality";
import { EdgeCrossingAngleMetric } from "./graph-metrics/implemented-metrics/edge-crossing-angle";
import { Metric } from "./graph-metrics/graph-metrics-iface";
import { GraphAlgorithms } from "./graph-algoritms";
export { AnchorOverrideSetting } from "./explicit-anchors";
export { placePositionOnGrid };

export { type ExplicitAnchors } from "./explicit-anchors";
export { type VisualModelWithOutsiders } from "./graph-iface";

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
	getWidth(node: INodeClassic);
	getHeight(node: INodeClassic);
}

export type XY = Omit<Position, "anchored">;

// The layout works like this. The layout package gets configuration from user, usually inserted through dialog.
// This configuration is converted to different set of constraints (this might have been a bit of overengineering, but it is not that bad).
// There are different set of constraints:
// 1) Actions which should be performed before we start the layouting. Meaning layouting in sense that we enter the loop which runs the algorithm 1 or more times to find the best layout.
// 2) Then actions which should be performed in the loop (For example run random layout, followed by stress layout, followed by layered algorithm)
// The actions in 1) and 2) are either GraphConversionConstraint or AlgorithmConfiguration, depending on the type of action
// But that isn't all, we also have pre- and post- conditions, which are special actions which should be performed before, respectively after the steps 1), 2)
// TODO: This feels like overengineering. ... I don't think that there is a reason to do this, it should be the same as in step 1
//       So in future it will be probably the mentioned 1), 2) and then in the same way stuff, which will be run post-layout




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


// TODO: What about layouting more than one semantic model?
/**
 * Layout given semantic model.
 */
export async function performLayoutOfSemanticModel(
	inputSemanticModel: Record<string, SemanticModelEntity>,
	semanticModelId: string,
	config: UserGivenAlgorithmConfigurationslVersion4,
	nodeDimensionQueryHandler?: NodeDimensionQueryHandler
): Promise<LayoutedVisualEntities> {
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
	const semanticModel: Map<string, EntityModel> = new Map();
	semanticModel.set(semanticModelId, entityModelUsedForConversion);

	const outsiders: Record<string, XY | null> = {}
	Object.keys([...semanticModel.values()][0].getEntities()).forEach(identifier => {
		outsiders[identifier] = null;
	});
	const entitiesToLayout: VisualEntitiesWithOutsiders = {
		visualEntities: [],
		outsiders,
	};

	const visualEntitiesPromise = performLayoutInternal(null, semanticModel, entitiesToLayout, config, nodeDimensionQueryHandler);
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
	const visualEntitiesPromise = performLayoutFromGraph(graph, config).then(result => result.convertWholeGraphToDataspecerRepresentation());

	if(visualEntitiesPromise == undefined) {
		console.log("LAYOUT FAILED")
		throw new Error("Layout Failed");
	}

	return visualEntitiesPromise;
}


/**
 * Layout given graph based on given layout configuration
 * @param graph
 * @param config
 * @param nodeDimensionQueryHandler
 * @param visualModel
 * @returns
 */
export async function performLayoutFromGraph(
	graph: IMainGraphClassic,
	config: UserGivenAlgorithmConfigurationslVersion4
): Promise<IMainGraphClassic> {
	const constraints = ConstraintFactory.createConstraints(config);

	// TODO: Try this later, now it isn't that important

	// const compactifyConstraint: IConstraintSimple  = {
	// 	name: "post-compactify",
	// 	type: "???",
	// 	constraintedNodes: "ALL",
	// 	constraintTime: "POST-MAIN",
	// 	data: undefined,
	// };
	// constraints.addSimpleConstraints(compactifyConstraint);

	const resultingLayoutPromise = performLayoutingBasedOnConstraints(graph, constraints);

	// TODO: DEBUG
	// console.log("THE END");
	// throw new Error("THE END");

	return resultingLayoutPromise;
}


/**
 * Performs all relevant layout operations based on given constraints
 */
const performLayoutingBasedOnConstraints = (
	graph: IMainGraphClassic,
	constraints: ConstraintContainer
): Promise<IMainGraphClassic> => {
	let workGraph = graph;
	return runPreMainAlgorithmConstraints(workGraph, constraints).then(async _ => {
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

		return runMainLayoutAlgorithm(workGraph, constraints).then(layoutedGraph => {
			return runPostMainAlgorithmConstraints(layoutedGraph, constraints).then(_ => layoutedGraph);
		});
	});

}


const runPreMainAlgorithmConstraints = async (
	graph: IMainGraphClassic,
	constraintsContainer: ConstraintContainer
): Promise<void[]> => {
	const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer, constraintsContainer.simpleConstraints, "PRE-MAIN").then(_ => {
		return runConstraintsInternal(graph, constraintsContainer, constraintsContainer.constraints, "PRE-MAIN");
	});
	return constraintPromises;
}

const runPostMainAlgorithmConstraints = async (graph: IMainGraphClassic,
												constraintsContainer: ConstraintContainer): Promise<void[]> => {
	return;
	// TODO: Already Invalid comment - Well it could actually work I just need to move the code with calling layered into CONSTRAINT_MAP
	//       To re-explain what this comments means - I wanted to have code which runs after the main alforithm - for example running layered algorithm
	//       which takes into consideration existing positions - which we currently support, but I decided that it was better to just have it within the main loop
	//       so POST-MAIN stuff will be probably only the stuff which will be run once after ALL! of the algorithms finish running.
	//       It can be then only used once we have the result which want to pass to the caller. So it will be some conversions, etc. but not the mentioned layered algorithm
	//       which runs algorithm in each iteration of loop that is finding best algorithm. The post-constraints are called only after the loop finishes.
	// const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer.simpleConstraints, "POST-MAIN", nodeDimensionQueryHandler).then(_ => {
	// 	return runConstraintsInternal(graph, constraintsContainer.constraints, "POST-MAIN", nodeDimensionQueryHandler);
	// });
	// return constraintPromises;
}

const runConstraintsInternal = async (
	graph: IMainGraphClassic,
	constraintContainer: ConstraintContainer,
	constraints: IConstraintSimple[] | IConstraint[],
	constraintTime: Omit<ConstraintTime, "IN-MAIN">
): Promise<void[]> => {
	const constraintPromises: Promise<void>[] = [];
	for(const constraint of constraints) {
		if(constraint.constraintTime === constraintTime) {
			constraintPromises.push(CONSTRAINT_MAP[constraint.name](graph, constraintContainer));
		}
	}

	return Promise.all(constraintPromises);
}


// TODO: Can be called in webworker ... but webworkers in node.js are worker threads and they are non-compatible, so it is too much of a hassle, so maybe later if necessary
// TODO: Also need a bit think about the iterating to find the best model, so the method will maybe need some small rework
/**
 * Run the main layouting algorithm for the given graph. TODO: Well it is not just the main, there may be layerify after, etc.
 */
const runMainLayoutAlgorithm = async (
	graph: IMainGraphClassic,
	constraints: ConstraintContainer
): Promise<IMainGraphClassic> => {
	// TODO: Well it really is overkill, like I could in the same way just have a look, if the given configuration contains numberOfAlgorithmRuns and if so, just put it here
	const metricsWithWeights: MetricWithWeight[] = [
		{
			name: "EdgeCrossingMetric",
			metric: new EdgeCrossingMetric(),
			weight: 1
		},
		{
			name: "EdgeCrossingAngleMetric",
			metric: new EdgeCrossingAngleMetric(),
			weight: 1
		},
		{
			name: "EdgeNodeCrossingMetric",
			metric: new EdgeNodeCrossingMetric(),
			weight: 20
		},
		{
			name: "AreaMetric",
			metric: new AreaMetric(),
			weight: 0.1
		},
		{
			name: "NodeOrthogonalityMetric",
			metric: new NodeOrthogonalityMetric(),
			weight: 0.2
		},
	];
	const computedMetricsData = createObjectsToHoldMetricsData(metricsWithWeights);
	const findBestLayoutConstraint = constraints.simpleConstraints.find(constraint => constraint.name === "Best layout iteration count");
	const numberOfAlgorithmRuns = (findBestLayoutConstraint?.data as any)?.numberOfAlgorithmRuns ?? 1;



	// TODO: There is still room for improvement - Split the preprare and run part in actions - since the force algorithm doesn't need to prepare on every iteration.
	//       It can be prepared once before. Then it just needs to always create new graph on layout, but the preparation can be done only once
	for(let i = 0; i < numberOfAlgorithmRuns; i++) {
		let workGraph = graph;		// TODO: Maybe create copy?
		let layoutedGraphPromise: Promise<IMainGraphClassic>;
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
	GraphAlgorithms.moveTestEdgeLenOneUp();			// TODO RadStr: DEBUG
	return computedMetricsData.metricResultAggregations["total"].max.graphPromise;
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
	graphPromise: Promise<IMainGraphClassic>
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

function performMetricsComputation(
	metricsToCompute: MetricWithWeight[],
	computedMetricsFromPreviousIterations: Record<string, number[]>,
	metricResultsAggregation: Record<string, MetricResultsAggregation>,
	graph: IMainGraphClassic,
	layoutedGraphPromise: Promise<IMainGraphClassic>,
) {
	const computedMetrics = [];
	for(const metricToCompute of metricsToCompute) {
		const computedMetric = metricToCompute.metric.computeMetric(graph as unknown as GraphClassic);		// TODO RadStr: Fix the typing
		computedMetricsFromPreviousIterations[metricToCompute.name].push(computedMetric);
		computedMetrics.push(computedMetric);

		setMetricResultsAggregation(metricResultsAggregation, metricToCompute.name, computedMetric, layoutedGraphPromise);
	}

	let absoluteMetric = 0;
	for(let i = 0; i < computedMetrics.length; i++) {
		absoluteMetric += metricsToCompute[i].weight * computedMetrics[i];
	}

	setMetricResultsAggregation(metricResultsAggregation, "total", absoluteMetric, layoutedGraphPromise);
}

function setMetricResultsAggregation(
	metricResultsAggregation: Record<string, MetricResultsAggregation>,
	key: string,
	computedMetric: number,
	layoutedGraphPromise: Promise<IMainGraphClassic>,
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
