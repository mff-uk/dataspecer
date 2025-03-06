import { ModelDsIdentifier } from "../../entity-model";
import { VisualOperationExecutor } from "./visual-operation-executor";

export function deleteEntityModel(
  executor: VisualOperationExecutor,
  model: ModelDsIdentifier,
) {
  executor.visualModel.deleteModelData(model);
}
