import { isVisualNode, isWritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

/**
 * Changes anchor to the opposite state. So if the node was not anchored then anchor it and otherway around.
 */
export function changeAnchorAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  identifier: string,
) {

  // TODO: After merge to main - again change the method signature to contain visual model - which we get by using the withVisualModel method
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  if (!isWritableVisualModel(visualModel)) {
    notifications.error("The active visual model is not writeable.");
    return;
  }
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
