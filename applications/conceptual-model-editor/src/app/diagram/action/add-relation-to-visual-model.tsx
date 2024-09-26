import { isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Add resource to the visual model and by doing so to the canvas as well.
 *
 * @param notifications
 * @param graph
 * @param model Owner of the entity to add visual representation for.
 * @param identifier Identifier of semantic entity to add visual representation for.
 */
export function addRelationToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  model: string,
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
  visualModel.addVisualRelationship({
    model: model,
    representedRelationship: identifier,
    waypoints: [],
  });
}
