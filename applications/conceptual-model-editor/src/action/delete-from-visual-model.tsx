import {
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isWritableVisualModel,
  type VisualEntity,
  type VisualModel,
} from "@dataspecer/core-v2/visual-model";

import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Delete resource from visual model and thus from the canvas.
 *
 * @param notifications
 * @param graph
 * @param identifier Identifier of semantic entity to remove visual entity for.
 */
export function deleteFromVisualModelAction(
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

  // Delete the visual entity.
  const visualEntity = visualModel.getVisualEntityForRepresented(identifier);
  if (visualEntity === null) {
    notifications.error("Entity is not part of the visual model.");
    console.log("Missing visual entity.", { identifier, visualModel });
    return;
  }
  const entitiesToRemove = [
    ...collectVisualEntitiesToRemove(visualModel, visualEntity),
    visualEntity.identifier
  ];
  // Perform the delete operation.
  entitiesToRemove.forEach(id => visualModel.deleteVisualEntity(id));
}

/**
 * Return entities that are related to the removed entity.
 * TODO: Move this to the visual model.
 */
function collectVisualEntitiesToRemove(visualModel: VisualModel, removedEntity: VisualEntity) {
  if (!isVisualNode(removedEntity)) {
    // If removed entity is not a node, there are no related
    // visual entities.
    return [];
  }
  return [...visualModel.getVisualEntities().values()].filter(entity => {
    // We look connection to the removed entity.
    if (isVisualRelationship(entity) || isVisualProfileRelationship(entity)) {
      return entity.visualSource === removedEntity.identifier ||
        entity.visualTarget === removedEntity.identifier;
    }
    return false;
  }).map(entity => entity.identifier);
}
