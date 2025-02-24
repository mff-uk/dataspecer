import {
  type VisualEntity,
  type VisualModel,
  WritableVisualModel,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
} from "@dataspecer/core-v2/visual-model";
import { removeVisualEntitiesFromVisualModelAction } from "./remove-visual-entities-from-visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";


/**
 * Remove entity and related entities from visual model.
 */
export function removeFromVisualModelByVisualAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  identifiers: string[],
) {
  const getVisualEntitiesForIdentifier = (identifier: string) => {
    const visualEntity = visualModel.getVisualEntity(identifier)
    return visualEntity === null ? [] : [visualEntity];
  };
  const entitiesToRemove = collectVisualEntitiesToRemove(visualModel, identifiers, getVisualEntitiesForIdentifier);
  removeVisualEntitiesFromVisualModelAction(notifications, visualModel, entitiesToRemove);
}

/**
 * @param getVisualEntitiesForIdentifier is any method which can transform given identifier into VisualEntity[].
 *
 * @returns Returns entities that are related to the removed entity.
 */
export function collectVisualEntitiesToRemove(
  visualModel: WritableVisualModel,
  identifiers: string[],
  getVisualEntitiesForIdentifier: (identifier: string) => VisualEntity[],
) {
  const visualEntitesToRemove = [];
  for (const identifier of identifiers) {
    // Find the visual entities.
    let visualEntities: VisualEntity[] = getVisualEntitiesForIdentifier(identifier);
    if (visualEntities.length === 0) {
      // The entity is not part of the visual model and thus should not be visible.
      // We ignore the operation for such entity and show an error.
      console.error("Missing visual entity.", { identifier, visualModel });
      continue;
    }

    for(const visualEntity of visualEntities) {
      visualEntitesToRemove.push(...collectVisualEntitiesToRemoveInternal(visualModel, visualEntity));
      visualEntitesToRemove.push(visualEntity);
    }
  }

  return visualEntitesToRemove;
}

/**
 * Return entities that are related to the removed entity.
 * TODO: Move this to the visual model.
 */
function collectVisualEntitiesToRemoveInternal(visualModel: VisualModel, removedEntity: VisualEntity) {
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