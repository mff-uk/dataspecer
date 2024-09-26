import { isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Remove resource from visual model and thus from the canvas.
 *
 * @param notifications
 * @param graph
 * @param identifier Identifier of semantic entity to remove visual entity for.
 */
export function removeFromVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  identifier: string,
) {
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  if (!isWritableVisualModel(visualModel)) {
    notifications.error("Visual model is not writable.");
    return;
  }
  //
  const entity = visualModel.getVisualEntityForRepresented(identifier);
  console.log("removeFromVisualModelAction", {entity, visualModel});
  if (entity === null) {
    notifications.error("Can not get visual entity.")
    return;
  }
  visualModel.deleteVisualEntity(entity.identifier);
}
