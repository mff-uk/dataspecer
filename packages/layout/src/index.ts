import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntity } from "@dataspecer/core-v2/visual-model";
import { ExtractedModel, LayoutAlgorithm, LayoutMethod, extractModelObjects } from "./layout-iface";

import { doRandomLayoutAdvanced } from "./basic-layouts";
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
	getDefaultUserGivenConstraintsVersion4
} from "./configs/constraints";
import { GraphClassic, GraphFactory, IMainGraphClassic, INodeClassic, MainGraphClassic, VisualEntityComplete } from "./graph-iface";
import { EdgeCrossingMetric } from "./graph-metrics/graph-metrics";
import { ConstraintContainer, ALGORITHM_NAME_TO_LAYOUT_MAPPING } from "./configs/constraint-container";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";
import { ConstraintFactory } from "./configs/constraint-factories";
import { ReactflowDimensionsEstimator } from "./dimension-estimators/reactflow-dimension-estimator";
import { VisualEntities } from "../../core-v2/lib/visual-model/visual-entity";
import { PhantomElementsFactory } from "./util/utils";
import { CONSTRAINT_MAP } from "./configs/constraints-mapping";

export type { IConstraintSimple, UserGivenConstraints, UserGivenAlgorithmConfigurationslVersion2 as UserGivenConstraintsVersion2, UserGivenAlgorithmConfigurationslVersion4 as UserGivenConstraintsVersion4 } from "./configs/constraints";
export { getDefaultUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion2, getDefaultMainUserGivenAlgorithmConstraint, getDefaultUserGivenConstraintsVersion4 } from "./configs/constraints";
export type { AlgorithmName } from "./configs/constraint-container";
export { DIRECTION } from "./util/utils";
export type { INodeClassic } from "./graph-iface"

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


/**
 * Perform layout, which puts given nodes on new positions, while preserving layout of the old graph
 * @param visualModel
 * @param semanticModels
 * @param newNodesIdentifiers
 * @param config
 * @param nodeDimensionQueryHandler
 */
export async function performDynamicLayout(visualModel: VisualEntityModel,
										semanticModels: Record<string, EntityModel>,
										newNodesIdentifiers: string[],
										config: UserGivenAlgorithmConfigurationslVersion2,
										nodeDimensionQueryHandler?: NodeDimensionQueryHandler) {
	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}

	// TODO: Here perform dynamic layouting on top of visual model
}


/**
 * Layout given visual model.
 * @param visualModel The visual model to perform layout on.
 * @param semanticModels
 * @param config
 * @param nodeDimensionQueryHandler
 * @returns Promise with new positions of the visual entities.
 */
export async function performLayoutOfVisualModel(visualModel: VisualEntityModel,
													semanticModels: Map<string, EntityModel>,
													config: UserGivenAlgorithmConfigurationslVersion4,
													nodeDimensionQueryHandler?: NodeDimensionQueryHandler): Promise<VisualEntities> {
	console.log("config");
	console.log(config);

	// TODO: For now for simplicity just concatenate all the semantic models into one
	let semanticModel: Record<string, SemanticModelEntity> = {};
	for(const currSemanticModel of semanticModels)  {
		semanticModel = {
			...semanticModel,
			...(currSemanticModel[1].getEntities() as Record<string, SemanticModelEntity>)
		};
	}

	const visualEntitiesPromise = performLayoutInternal(visualModel, semanticModel, config, nodeDimensionQueryHandler);
	return visualEntitiesPromise;
}


// TODO: What about layouting more than one semantic model?
/**
 * Layout given semantic model.
 */
export async function performLayoutOfSemanticModel(inputSemanticModel: Record<string, SemanticModelEntity>,
													config: UserGivenAlgorithmConfigurationslVersion4,
													nodeDimensionQueryHandler?: NodeDimensionQueryHandler): Promise<VisualEntities> {
	const visualEntitiesPromise = performLayoutInternal(null, inputSemanticModel, config, nodeDimensionQueryHandler);
	return visualEntitiesPromise;
}


function performLayoutInternal(visualModel: VisualEntityModel | null,
								semanticModel: Record<string, SemanticModelEntity>,
								config: UserGivenAlgorithmConfigurationslVersion4,
								nodeDimensionQueryHandler?: NodeDimensionQueryHandler): Promise<VisualEntities> {
	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}

	const graph = GraphFactory.createMainGraph(null, semanticModel, null, visualModel);
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

	console.warn("constraints");
	console.warn(constraints);
	return runPreMainAlgorithmConstraints(graph, constraints, nodeDimensionQueryHandler).then(_ => {
		if(constraints.algorithmOnlyConstraints["GENERALIZATION"] !== undefined) {
			graph.createGeneralizationSubgraphs();
			console.info("graph.allEdges");
			console.info(graph.allEdges);
			// throw new Error("THE END of subgraphs");

			const generalizationAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["GENERALIZATION"].algorithmName];
			generalizationAlgorithm.prepareFromGraph(graph, constraints, nodeDimensionQueryHandler);
			return generalizationAlgorithm.runGeneralizationLayout(true).then(generalizationResult => {
				return runMainLayoutAlgorithm(generalizationResult, constraints, nodeDimensionQueryHandler).then(result => {
					return runPostMainAlgorithmConstraints(result, constraints, nodeDimensionQueryHandler).then(_ => result);
				});
			});
		}
		else {
			return runMainLayoutAlgorithm(graph, constraints, nodeDimensionQueryHandler).then(result => {
				return runPostMainAlgorithmConstraints(result, constraints, nodeDimensionQueryHandler).then(_ => result);
			});
		}
	});

}


const runPreMainAlgorithmConstraints = async (graph: IMainGraphClassic,
												constraintsContainer: ConstraintContainer,
												nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer.simpleConstraints, "PRE-MAIN", nodeDimensionQueryHandler).then(_ => {
		return runConstraintsInternal(graph, constraintsContainer.constraints, "PRE-MAIN", nodeDimensionQueryHandler);
	});
	return constraintPromises;
}

const runPostMainAlgorithmConstraints = async (graph: IMainGraphClassic,
												constraintsContainer: ConstraintContainer,
												nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	return;
	// TODO: Well it could actually work I just need to move the code with calling layered into CONSTRAINT_MAP
	// const constraintPromises: Promise<void[]> = runConstraintsInternal(graph, constraintsContainer.simpleConstraints, "POST-MAIN", nodeDimensionQueryHandler).then(_ => {
	// 	return runConstraintsInternal(graph, constraintsContainer.constraints, "POST-MAIN", nodeDimensionQueryHandler);
	// });
	// return constraintPromises;
}

const runConstraintsInternal = async (graph: IMainGraphClassic,
										constraints: IConstraintSimple[] | IConstraint[],
										constraintTime: Omit<ConstraintTime, "IN-MAIN">,
										nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<void[]> => {
	const constraintPromises: Promise<void>[] = [];
	for(const constraint of constraints) {
		if(constraint.constraintTime === constraintTime) {
			constraintPromises.push(CONSTRAINT_MAP[constraint.name](graph, nodeDimensionQueryHandler));
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
	let minEdgeCrossCount = 1000000;
	const edgeCrossingMetric: EdgeCrossingMetric = new EdgeCrossingMetric();
	const findBestLayoutConstraint = constraints.simpleConstraints.find(constraint => constraint.name === "Best layout iteration count");
	const numberOfAlgorithmRuns = (findBestLayoutConstraint?.data as any)?.numberOfAlgorithmRuns ?? 1;
	const mainLayoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["ALL"].algorithmName];
	// TODO: Another special case for force and stress, because stress needs different initial graph every time, force can prepare it once
	if(findBestLayoutConstraint === undefined || constraints.algorithmOnlyConstraints["ALL"].algorithmName === "elk_force") {
		mainLayoutAlgorithm.prepareFromGraph(graph, constraints, nodeDimensionQueryHandler);
	}

	for(let i = 0; i < numberOfAlgorithmRuns; i++) {
		// TODO: Again should be solved better (in preconditions or something) ...
		//       I think that I should rewrite so I can just run multiple algorithms in succession and add pre-,post- conditions then I am happy with it
		if(findBestLayoutConstraint !== undefined) {
			if(constraints.algorithmOnlyConstraints.ALL.algorithmName === "elk_stress") {
				constraints.algorithmOnlyConstraints.ALL.addAlgorithmConstraint("interactive", "true");
				const randomLayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING["random"];
				randomLayoutAlgorithm.prepareFromGraph(graph, constraints, nodeDimensionQueryHandler);
				// TODO: Can be solved without await
				await randomLayoutAlgorithm.run(true).then(layoutedGraph => {
					mainLayoutAlgorithm.prepareFromGraph(layoutedGraph, constraints, nodeDimensionQueryHandler);
				})
			}
		}

		const layoutedGraphPromise: Promise<IMainGraphClassic> = mainLayoutAlgorithm.run(true).then(layoutedGraph => {
			const shouldRunLayoutAfterConstraint = constraints.simpleConstraints.find(constraint => constraint.name === "Run layered after");
			if(shouldRunLayoutAfterConstraint === undefined) {
				return layoutedGraph;
			}
			else {
				const configAfter = getDefaultUserGivenConstraintsVersion4();
				configAfter.chosenMainAlgorithm = "elk_layered";

				configAfter.main.elk_layered.advanced_settings = {
					"crossingMinimization.semiInteractive": true,
					"crossingCounterNodeInfluence": 0,
					"cycleBreaking.strategy": "INTERACTIVE",
					"spacing.nodeNodeBetweenLayers": 350,
     				"spacing.nodeNode": 350,
				};
				const constraintsAfter = ConstraintFactory.createConstraints(configAfter);

				// TODO: Another awful workaround .... it really needs like 3 more days of implementation for it to be all in consistent state
				//       Ideally it would have been passed in another constraint which fixes the generalization graphs
				if(constraints.algorithmOnlyConstraints.GENERALIZATION !== undefined) {
					constraintsAfter.algorithmOnlyConstraints.GENERALIZATION = {...constraints.algorithmOnlyConstraints.GENERALIZATION};
				}
				console.log("constraintsAfter");
				console.log(constraintsAfter);
				const layeredAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[configAfter.chosenMainAlgorithm];
				layeredAlgorithm.prepareFromGraph(layoutedGraph, constraintsAfter, nodeDimensionQueryHandler);
				// console.log(configAfter);
				return layeredAlgorithm.run(false);
			}
		});
		const layoutedGraph = await layoutedGraphPromise;

		// const visualEntities = layoutedGraph.convertWholeGraphToDataspecerRepresentation();
		// console.log(visualEntities);

		const edgeCrossCountForCurrMetric = edgeCrossingMetric.computeMetric(layoutedGraph);
		console.log("Edge cross count: " + edgeCrossCountForCurrMetric);
		if(minEdgeCrossCount > edgeCrossCountForCurrMetric) {
			console.log("MIN Edge cross count: " + edgeCrossCountForCurrMetric);
			bestLayoutedVisualEntitiesPromise = layoutedGraphPromise;
			minEdgeCrossCount = edgeCrossCountForCurrMetric;
		}
	}

	console.info("minEdgeCrossCount");
	console.info(minEdgeCrossCount);

	return bestLayoutedVisualEntitiesPromise;
}

