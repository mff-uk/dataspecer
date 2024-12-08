import {
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isWritableVisualModel,
  WritableVisualModel,
  type VisualEntity,
  type VisualModel,
} from "@dataspecer/core-v2/visual-model";

import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";


// TODO: PRQuestion - Added visualModel argument so it can be called with withVisualModel
/**
 * Remove entity and related entities from visual model.
 */
export function removeFromVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  identifiers: string[],
) {
  const entitiesToRemove: string[] = [];
  for (const identifier of identifiers) {
    // Find the visual entities.
    const visualEntity = visualModel.getVisualEntityForRepresented(identifier);
    if (visualEntity === null) {
      // The entity is not part of the visual model and thus should not be visible.
      // We ignore the operation for such entity and show an error.
      // TODO PRQuestion: Only error? not notification error?
      console.error("Missing visual entity.", { identifier, visualModel });
      continue;
    }

    entitiesToRemove.push(...collectVisualEntitiesToRemove(visualModel, visualEntity));
    entitiesToRemove.push(visualEntity.identifier);
  }
  // Perform the delete operation of collected visual entities.
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
