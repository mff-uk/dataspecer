import { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { addVisualRelationship } from "./add-visual-relationship";

/**
 * @throws DataspecerError
 */
export function addSemanticGeneralizationToVisualModel(
  visualModel: WritableVisualModel,
  model: string,
  generalization: SemanticModelGeneralization,
) {
  const {id, child, parent} = generalization;
  addVisualRelationship(visualModel, model, id, child, parent);
}
