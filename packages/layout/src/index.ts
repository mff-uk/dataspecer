import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
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
	SPECIFIC_ALGORITHM_CONVERSIONS_MAP
} from "./configs/constraints";
import { GraphClassic, GraphFactory, IMainGraphClassic, INodeClassic, MainGraphClassic, VisualNodeComplete } from "./graph-iface";
import { ConstraintContainer, ALGORITHM_NAME_TO_LAYOUT_MAPPING } from "./configs/constraint-container";
import { Entities, Entity, EntityModel } from "@dataspecer/core-v2";
import { ConstraintFactory } from "./configs/constraint-factories";
import { ReactflowDimensionsEstimator } from "./dimension-estimators/reactflow-dimension-estimator";
import { PhantomElementsFactory } from "./util/utils";
import { CONSTRAINT_MAP } from "./configs/constraints-mapping";
import type { VisualEntities, VisualEntitiesAllType } from "./migration-to-cme-v2";
export type { VisualEntitiesAllType }
import { EdgeCrossingMetric } from "./graph-metrics/implemented-metrics/edge-crossing";
import { EdgeNodeCrossingMetric } from "./graph-metrics/implemented-metrics/edge-node-crossing";

export type { IConstraintSimple, UserGivenConstraints, UserGivenAlgorithmConfigurationslVersion2 as UserGivenConstraintsVersion2, UserGivenAlgorithmConfigurationslVersion4 as UserGivenConstraintsVersion4 } from "./configs/constraints";
export { getDefaultUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion2, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4 } from "./configs/constraints";
export type { AlgorithmName } from "./configs/constraint-container";

export { Direction } from "./util/utils";
export type { INodeClassic } from "./graph-iface"

export { ReactflowDimensionsEstimator }
export { ReactflowDimensionsConstantEstimator } from "./dimension-estimators/constant-dimension-estimator";

import type { EdgeRouting } from "./configs/constraints";
export type { EdgeRouting }

import { placePositionOnGrid } from "./util/utils";
export { placePositionOnGrid }

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
 * Perform layout, which puts given nodes on new positions, while preserving layout of the old graph
 * @param visualModel
 * @param semanticModels
 * @param newNodesIdentifiers
 * @param config
 * @param nodeDimensionQueryHandler
 */
export async function performDynamicLayout(visualModel: VisualModel,
										semanticModels: Record<string, EntityModel>,
										newNodesIdentifiers: string[],
										config: UserGivenAlgorithmConfigurationslVersion2,
										nodeDimensionQueryHandler?: NodeDimensionQueryHandler) {
	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}

	// TODO: Here perform dynamic layouting on top of visual model
}


type AnchorOverrideSetting = "only-original-anchors" | "merge-with-original-anchors" | "only-given-anchors" | "anchor-everything-except-notAnchored";


export type ExplicitAnchors = {
	/**
	 * The identifiers of nodes, which should not be anchored.
	 */
	notAnchored: string[],
	/**
	 * The identifiers of nodes, which should not be anchored. NOT Used only if {@link shouldAnchorEverythingExceptNotAnchored} is set to "only-original-anchors".
	 */
	anchored: string[],
	
	shouldAnchorEverythingExceptNotAnchored: AnchorOverrideSetting,
};

/**
 * Layout given visual model.
 * @param visualModel The visual model to perform layout on.
 * @param semanticModels
 * @param config
 * @param nodeDimensionQueryHandler
 * @param explicitAnchors If this is undefined then use the anchors of visual model, otherwise it depends on the given anchors' settings.
 * @returns Promise with new positions of the visual entities.
 */
export async function performLayoutOfVisualModel(visualModel: VisualModel,
													semanticModels: Map<string, EntityModel>,
													config: UserGivenAlgorithmConfigurationslVersion4,
													nodeDimensionQueryHandler?: NodeDimensionQueryHandler,
													explicitAnchors?: ExplicitAnchors): Promise<VisualEntities> {
	console.log("config");
	console.log(config);

	const visualEntitiesPromise = performLayoutInternal(visualModel, semanticModels, config, nodeDimensionQueryHandler, explicitAnchors);
	return visualEntitiesPromise;
}


// TODO: What about layouting more than one semantic model?
/**
 * Layout given semantic model.
 */
export async function performLayoutOfSemanticModel(inputSemanticModel: Record<string, SemanticModelEntity>,
													semanticModelId: string,
													config: UserGivenAlgorithmConfigurationslVersion4,
													nodeDimensionQueryHandler?: NodeDimensionQueryHandler): Promise<VisualEntities> {
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
	const semanticModel = new Map();
	semanticModel.set(semanticModelId, entityModelUsedForConversion);
	const visualEntitiesPromise = performLayoutInternal(null, semanticModel, config, nodeDimensionQueryHandler);
	return visualEntitiesPromise;
}


function performLayoutInternal(visualModel: VisualModel | null,
								semanticModels: Map<string, EntityModel>,
								config: UserGivenAlgorithmConfigurationslVersion4,
								nodeDimensionQueryHandler?: NodeDimensionQueryHandler,
								explicitAnchors?: ExplicitAnchors): Promise<VisualEntities> {
	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}

	const graph = GraphFactory.createMainGraph(null, semanticModels, null, visualModel, explicitAnchors);
	const visualEntitiesPromise = performLayoutFromGraph(graph, config, nodeDimensionQueryHandler);

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
export async function performLayoutFromGraph(graph: IMainGraphClassic,
												config: UserGivenAlgorithmConfigurationslVersion4,
												nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<VisualEntities> {
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

	const resultingLayoutPromise = performLayoutingBasedOnConstraints(graph, constraints, nodeDimensionQueryHandler);

	// TODO: DEBUG
	// console.log("THE END");
	// throw new Error("THE END");

	return resultingLayoutPromise.then(result => result.convertWholeGraphToDataspecerRepresentation());
}


/**
 * Performs all relevant layout operations based on given constraints
 */
const performLayoutingBasedOnConstraints = (graph: IMainGraphClassic,
											constraints: ConstraintContainer,
											nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<IMainGraphClassic> => {
	let workGraph = graph;
	return runPreMainAlgorithmConstraints(workGraph, constraints, nodeDimensionQueryHandler).then(async _ => {
		for(const action of constraints.layoutActionsIteratorBefore) {
			if(action instanceof GraphConversionConstraint) {
				SPECIFIC_ALGORITHM_CONVERSIONS_MAP[action.actionName](action, workGraph);
			}
			else if(action instanceof AlgorithmConfiguration) {		// TODO: Using the actual type instead of interface
				const layoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[action.algorithmName];
				if(action.algorithmPhasesToCall === "ONLY-PREPARE" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
					layoutAlgorithm.prepareFromGraph(workGraph, constraints, nodeDimensionQueryHandler);
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

		return runMainLayoutAlgorithm(workGraph, constraints, nodeDimensionQueryHandler).then(layoutedGraph => {
			return runPostMainAlgorithmConstraints(layoutedGraph, constraints, nodeDimensionQueryHandler).then(_ => layoutedGraph);
		});
	});

}


const runPreMainAlgorithmConstraints = async (graph: IMainGraphClassic,
												constraintsContainer: ConstraintContainer,
												nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer, constraintsContainer.simpleConstraints, "PRE-MAIN", nodeDimensionQueryHandler).then(_ => {
		return runConstraintsInternal(graph, constraintsContainer, constraintsContainer.constraints, "PRE-MAIN", nodeDimensionQueryHandler);
	});
	return constraintPromises;
}

const runPostMainAlgorithmConstraints = async (graph: IMainGraphClassic,
												constraintsContainer: ConstraintContainer,
												nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	return;
	// TODO: Already Invalid comment - Well it could actually work I just need to move the code with calling layered into CONSTRAINT_MAP
	// const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer.simpleConstraints, "POST-MAIN", nodeDimensionQueryHandler).then(_ => {
	// 	return runConstraintsInternal(graph, constraintsContainer.constraints, "POST-MAIN", nodeDimensionQueryHandler);
	// });
	// return constraintPromises;
}

const runConstraintsInternal = async (graph: IMainGraphClassic,
										constraintContainer: ConstraintContainer,
										constraints: IConstraintSimple[] | IConstraint[],
										constraintTime: Omit<ConstraintTime, "IN-MAIN">,
										nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	const constraintPromises: Promise<void>[] = [];
	for(const constraint of constraints) {
		if(constraint.constraintTime === constraintTime) {
			constraintPromises.push(CONSTRAINT_MAP[constraint.name](graph, constraintContainer, nodeDimensionQueryHandler));
		}
	}

	return Promise.all(constraintPromises);
}


// TODO: Can be called in webworker ... but webworkers in node.js are worker threads and they are non-compatible, so it is too much of a hassle, so maybe later if necessary
// TODO: Also need a bit think about the iterating to find the best model, so the method will maybe need some small rework
/**
 * Run the main layouting algorithm for the given graph. TODO: Well it is not just the main, there may be layerify after, etc.
 */
const runMainLayoutAlgorithm = async (graph: IMainGraphClassic,
										constraints: ConstraintContainer,
										nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<IMainGraphClassic> => {
											// TODO: Well it really is overkill, like I could in the same way just have a look, if the given configuration contains numberOfAlgorithmRuns and if so, just put it here
	let bestLayoutedVisualEntitiesPromise: Promise<IMainGraphClassic>;
	let minAbsoluteMetric = 1000000;
	const edgeCrossingMetric: EdgeCrossingMetric = new EdgeCrossingMetric();
	const edgeNodeCrossingMetric: EdgeNodeCrossingMetric = new EdgeNodeCrossingMetric();
	const findBestLayoutConstraint = constraints.simpleConstraints.find(constraint => constraint.name === "Best layout iteration count");
	const numberOfAlgorithmRuns = (findBestLayoutConstraint?.data as any)?.numberOfAlgorithmRuns ?? 1;



	// TODO: There is still room for improvement - Split the preprare and run part in actions - since the force algorithm doesn't need to prepare on every iteration.
	//       It can be prepared once before. Then it just needs to always create new graph on layout, but the preparation can be done only once
	for(let i = 0; i < numberOfAlgorithmRuns; i++) {
		let workGraph = graph;		// TODO: Maybe create copy?
		graph.mainGraph.resetForNewLayout();		// TODO: Actually I feel like it should also be action (of type AlgorithmConversionConstraint), but maybe not
		let layoutedGraphPromise: Promise<IMainGraphClassic>;
		for(const action of constraints.layoutActionsIterator) {
			if(action instanceof GraphConversionConstraint) {
				SPECIFIC_ALGORITHM_CONVERSIONS_MAP[action.actionName](action, graph);
			}
			else if(action instanceof AlgorithmConfiguration) {		// TODO: Using the actual type instead of interface
				const layoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[action.algorithmName];
				if(action.algorithmPhasesToCall === "ONLY-PREPARE" || action.algorithmPhasesToCall === "PREPARE-AND-RUN") {
					layoutAlgorithm.prepareFromGraph(workGraph, constraints, nodeDimensionQueryHandler);
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

		const edgeCrossCountForCurrent = edgeCrossingMetric.computeMetric(workGraph);
		const edgeNodeCrossCountForCurrent = edgeNodeCrossingMetric.computeMetric(workGraph);
		const absoluteMetricForCurrent = edgeCrossCountForCurrent + edgeNodeCrossCountForCurrent;

		console.log("Edge cross count: " + edgeCrossCountForCurrent);
		console.log("Edge node cross count: " + edgeNodeCrossCountForCurrent);
		console.log("Metric total: " + absoluteMetricForCurrent);


		if(minAbsoluteMetric > absoluteMetricForCurrent) {
			console.log("MIN!");
			bestLayoutedVisualEntitiesPromise = layoutedGraphPromise;
			minAbsoluteMetric = absoluteMetricForCurrent;
		}

		constraints.resetLayoutActionsIterator();
	}

	console.log("MIN Metric total: " + minAbsoluteMetric);
	console.log(await bestLayoutedVisualEntitiesPromise);
	return bestLayoutedVisualEntitiesPromise;
}
