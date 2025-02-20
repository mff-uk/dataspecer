import { isVisualNode, isVisualProfileRelationship, isVisualRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";

export function createNodeDuplicateAction(
  notifications: UseNotificationServiceWriterType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
) {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Unable to find source node to create duplicate of");
    return;
  }
  if(!isVisualNode(node)) {
    notifications.error("The given node to create duplicate of is not a node");
    return;
  }

  const duplicatedNodeIdentifier = visualModel.addVisualNode({
    ...node
  });

  addRelatedEdgesDuplicatesToVisualModel(
    visualModel, nodeIdentifier, duplicatedNodeIdentifier
  )
}

function addRelatedEdgesDuplicatesToVisualModel(
  visualModel: WritableVisualModel,
  originalNodeIdentifier: string,
  duplicateNodeIdentifier: string,
) {
  const visualEntities = visualModel.getVisualEntities();
  visualEntities.forEach((visualEntity, _) => {
    if(isVisualRelationship(visualEntity)) {
      if(visualEntity.visualSource === originalNodeIdentifier) {
        visualModel.addVisualRelationship({
          ...visualEntity,
          visualSource: duplicateNodeIdentifier
        });
      }
      // Not else if, because of edge loops
      if(visualEntity.visualTarget === originalNodeIdentifier) {
        visualModel.addVisualRelationship({
          ...visualEntity,
          visualTarget: duplicateNodeIdentifier
        });
      }
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      if(visualEntity.visualSource === originalNodeIdentifier) {
        visualModel.addVisualProfileRelationship({
          ...visualEntity,
          visualSource: duplicateNodeIdentifier
        });
      }
      // Not else if, because of edge loops
      if(visualEntity.visualTarget === originalNodeIdentifier) {
        visualModel.addVisualProfileRelationship({
          ...visualEntity,
          visualTarget: duplicateNodeIdentifier
        });
      }
    }
  });
}
