import { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { addVisualRelationships } from "./add-visual-relationships";
import { ModelDsIdentifier } from "../../entity-model";
import { getAllVisualEndsForRelationship } from "../../../action/utilities";

/**
 * @throws DataspecerError
 */
export function addSemanticGeneralizationToVisualModel(
  visualModel: WritableVisualModel,
  model: ModelDsIdentifier,
  generalization: SemanticModelGeneralization,
) {
  const {id, child, parent} = generalization;
  const { visualSources, visualTargets } = getAllVisualEndsForRelationship(
    visualModel, child, parent);
  addVisualRelationships(
    visualModel, model, id, visualSources, visualTargets);
}
