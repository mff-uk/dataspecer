import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { deleteEntity } from "@dataspecer/core-v2/semantic-model/operations";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { deleteFromVisualModelAction } from "./delete-from-visual-model";

/**
 * Removes an entity from the given semantic model.
 * Once deleted, the action call an action to make sure the entity is removed from visual model.
 *
 * @param notifications
 * @param graph
 * @param modelIdentifier
 * @param identifier
 */
export async function deleteFromSemanticModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  modelIdentifier: string,
  identifier: string,
) {
  const model = graph.models.get(modelIdentifier);
  if (model === undefined) {
    notifications.error(`Can not find model with identifier '${modelIdentifier}'.`);
    return;
  }
  //
  if (model instanceof InMemorySemanticModel) {
    const result = model.executeOperation(deleteEntity(identifier));
    if (!result.success) {
      notifications.error("Can not delete model.");
    }
  } else if (model instanceof ExternalSemanticModel) {
    try {
      await model.releaseClass(identifier);
    } catch (error) {
      console.error("Can not delete model.", error);
      notifications.error("Can not delete model.");
    }
  } else {
    notifications.error("We can not use this model type.");
    return;
  }
  // We also need to remove from visual model.
  deleteFromVisualModelAction(notifications, graph, identifier);
}
