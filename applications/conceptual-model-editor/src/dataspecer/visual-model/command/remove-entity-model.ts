import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelDsIdentifier } from "../../entity-model";

export function removeEntityModel(
  visualModel: WritableVisualModel,
  model: ModelDsIdentifier,
) {
  visualModel.deleteModelData(model);
}
