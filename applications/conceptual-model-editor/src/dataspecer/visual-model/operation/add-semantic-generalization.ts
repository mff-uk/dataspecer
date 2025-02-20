import { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { addVisualRelationship } from "./add-visual-relationship";
import { ModelDsIdentifier } from "../../entity-model";

/**
 * @throws DataspecerError
 */
export function addSemanticGeneralizationToVisualModel(
  visualModel: WritableVisualModel,
  model: ModelDsIdentifier,
  generalization: SemanticModelGeneralization,
) {
  const {id, child, parent} = generalization;
  addVisualRelationship(visualModel, model, id, child, parent, null, null);
}
