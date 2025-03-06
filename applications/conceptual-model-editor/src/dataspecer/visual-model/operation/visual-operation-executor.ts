import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

export interface VisualOperationExecutor {

  visualModel: WritableVisualModel;

}

export function createVisualOperationExecutor(
  visualModel: WritableVisualModel,
) {
  return {
    visualModel,
  };
}
