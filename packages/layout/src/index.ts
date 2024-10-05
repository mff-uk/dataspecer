import { SemanticModelEntity, isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { VisualEntity } from "@dataspecer/core-v2/visual-model";
import { ExtractedModel, LayoutAlgorithm, LayoutMethod, extractModelObjects } from "./layout-iface";

import { doRandomLayoutAdvanced } from "./basic-layouts";
import { UserGivenConstraints, UserGivenAlgorithmConfigurationslVersion2 } from "./configs/constraints";
import { GraphClassic, INodeClassic, VisualEntityComplete } from "./graph-iface";
import { EdgeCrossingMetric } from "./graph-metrics/graph-metrics";
import { ConstraintContainer, ALGORITHM_NAME_TO_LAYOUT_MAPPING } from "./configs/constraint-container";
import { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { EntityModel } from "@dataspecer/core-v2";
import { ConstraintFactory } from "./configs/constraint-factories";
import { ReactflowDimensionsEstimator } from "./reactflow-dimension-estimator";
import { VisualEntities } from "../../core-v2/lib/visual-model/visual-entity";

export type { IConstraintSimple, UserGivenConstraints, UserGivenAlgorithmConfigurationslVersion2 as UserGivenConstraintsVersion2 } from "./configs/constraints";
export { getDefaultUserGivenAlgorithmConstraint } from "./configs/constraints";
export type { AlgorithmName } from "./configs/constraint-container";
export { DIRECTION } from "./utils";

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

export interface NodeDimensionQueryHandler {
	getWidth(node: INodeClassic);
	getHeight(node: INodeClassic);
}

export async function doEditorLayout(visualModel: VisualEntityModel,
										semanticModels: Record<string, EntityModel>,
										nodeDimensionQueryHandler?: NodeDimensionQueryHandler) {
	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}

	// TODO: Here perform layouting on top of visual model
}


// export async function doLayout(inputSemanticModel: Record<string, SemanticModelEntity>,
//     config: Record<string, IConstraintSimple>): Promise<VisualEntities> {
export async function doLayout(inputSemanticModel: Record<string, SemanticModelEntity>,
								config: UserGivenAlgorithmConfigurationslVersion2,
								nodeDimensionQueryHandler?: NodeDimensionQueryHandler): Promise<VisualEntities> {
	// tryCreateClassicGraph();

	if(nodeDimensionQueryHandler === undefined) {
		nodeDimensionQueryHandler = new ReactflowDimensionsEstimator();
	}


	const constraints = ConstraintFactory.createConstraints(config);
	const extractedModel = extractModelObjects(inputSemanticModel);
	const mainLayoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["ALL"].algorithmName];
	const graph = new GraphClassic(extractedModel);
	mainLayoutAlgorithm.prepare(extractedModel, constraints, nodeDimensionQueryHandler);
	const layoutedVisualEntitiesPromise: Promise<VisualEntities> = mainLayoutAlgorithm.run();
	return layoutedVisualEntitiesPromise;
}


export async function doFindBestLayout(inputSemanticModel: Record<string, SemanticModelEntity>,
										config: UserGivenAlgorithmConfigurationslVersion2,
										nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<VisualEntities> {
	const constraints = ConstraintFactory.createConstraints(config);
	const extractedModel = extractModelObjects(inputSemanticModel);
	const resultingLayout = findBestLayout(extractedModel, constraints, nodeDimensionQueryHandler);

	return await resultingLayout;
}

/**
 * TODO: The idea is that this will be called inside Webworker - each Webworker finds the best layout and then we pick the absolute best in the main.
 * @param extractedModel
 * @param constraints
 * @returns
 */
export async function findBestLayout(extractedModel: ExtractedModel,
										constraints: ConstraintContainer,
										nodeDimensionQueryHandler: NodeDimensionQueryHandler): Promise<VisualEntities> {
	const mainLayoutAlgorithm: LayoutAlgorithm = ALGORITHM_NAME_TO_LAYOUT_MAPPING[constraints.algorithmOnlyConstraints["ALL"].algorithmName];
	let bestLayoutedVisualEntities: Promise<VisualEntities>;
	let minEdgeCrossCount = 1000000;
	const edgeCrossingMetric: EdgeCrossingMetric = new EdgeCrossingMetric();
	const graph = new GraphClassic(extractedModel);
	for(let i = 0; i < 1; i++) {
		mainLayoutAlgorithm.prepare(extractedModel, constraints, nodeDimensionQueryHandler);
		const layoutedVisualEntitiesPromise: Promise<VisualEntities> = mainLayoutAlgorithm.run();
		const layoutedVisualEntities = await layoutedVisualEntitiesPromise;
		Object.keys(layoutedVisualEntities).forEach(key => graph.nodes[key].completeVisualEntity = new VisualEntityComplete(layoutedVisualEntities[key], 500, 300));
		const edgeCrossCountForCurrMetric = edgeCrossingMetric.computeMetric(graph);
		// console.log("Edge cross count: " + edgeCrossCountForCurrMetric);
		if(minEdgeCrossCount > edgeCrossCountForCurrMetric) {
			// console.log("MIN Edge cross count: " + edgeCrossCountForCurrMetric);
			bestLayoutedVisualEntities = layoutedVisualEntitiesPromise;
			minEdgeCrossCount = edgeCrossCountForCurrMetric;
		}
	}

	return bestLayoutedVisualEntities;
}