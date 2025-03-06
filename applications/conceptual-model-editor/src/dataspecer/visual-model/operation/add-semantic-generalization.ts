import { SemanticModelGeneralization } from "@dataspecer/core-v2/semantic-model/concepts";
import { addVisualRelationship } from "./add-visual-relationship";
import { ModelDsIdentifier } from "../../entity-model";
import { VisualOperationExecutor } from "./visual-operation-executor";

/**
 * @throws DataspecerError
 */
export function addSemanticGeneralizationToVisualModel(
  executor: VisualOperationExecutor,
  model: ModelDsIdentifier,
  generalization: SemanticModelGeneralization,
) {
  const {id, child, parent} = generalization;
  addVisualRelationship(executor, model, id, child, parent);
}
