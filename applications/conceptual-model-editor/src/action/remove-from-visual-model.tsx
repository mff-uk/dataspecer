import {
  type VisualEntity,
  type VisualModel,
  WritableVisualModel,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
} from "@dataspecer/core-v2/visual-model";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { removePartOfGroupContentAction } from "./remove-part-of-group-content";

/**
 * Remove entity and related entities from visual model.
 */
export function removeFromVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  identifiers: string[],
  areIdentifersOnInputVisual: boolean,
) {
  const entitiesToRemove: VisualEntity[] = [];
  for (const identifier of identifiers) {
    // Find the visual entities.
    let visualEntities: VisualEntity[];
    if(areIdentifersOnInputVisual) {
      const visualEntity = visualModel.getVisualEntity(identifier)
      visualEntities = visualEntity === null ? [] : [visualEntity];
    }
    else {
      visualEntities = visualModel.getVisualEntitiesForRepresented(identifier);
    }
    if (visualEntities.length === 0) {
      // The entity is not part of the visual model and thus should not be visible.
      // We ignore the operation for such entity and show an error.
      console.error("Missing visual entity.", { identifier, visualModel });
      continue;
    }

    for(const visualEntity of visualEntities) {
      entitiesToRemove.push(...collectVisualEntitiesToRemove(visualModel, visualEntity));
      entitiesToRemove.push(visualEntity);
    }
  }
  // Perform the delete operation of collected visual entities.
  const entitiesToRemoveIdentifiers = entitiesToRemove.map(entity => entity.identifier);
  const removedGroups: string[] = [];
  entitiesToRemove.forEach(entity => {
    if(isVisualGroup(entity) && !removedGroups.includes(entity.identifier)) {
      const isGroupRemoved = removePartOfGroupContentAction(notifications, visualModel, entity.identifier, entitiesToRemoveIdentifiers, false);
      if(isGroupRemoved) {
        removedGroups.push(entity.identifier);
      }
      return;
    }
    visualModel.deleteVisualEntity(entity.identifier);
  });
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
    else if(isVisualGroup(entity)) {
      return entity.content.includes(removedEntity.identifier);
    }
    return false;
  });
}
