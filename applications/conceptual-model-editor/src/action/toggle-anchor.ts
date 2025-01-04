import { WritableVisualModel, isVisualNode } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Changes anchor to the opposite state.
 * So if the node was not anchored then anchor it and other way around.
 */
export function toggleAnchorAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  identifier: string,
) {
  const visualEntity = visualModel.getVisualEntityForRepresented(identifier);
  if(visualEntity === null) {
    notifications.error("The entity to change anchor for doesn't exist.");
    return;
  }
  if(!isVisualNode(visualEntity)) {
    notifications.error("The entity to change anchor for is not a node.");
    return;
  }
  visualEntity.position.anchored = visualEntity.position.anchored === true ? null : true;
  visualModel.updateVisualEntity(visualEntity.identifier, visualEntity);
};
