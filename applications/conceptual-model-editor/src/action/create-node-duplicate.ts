import {
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  VisualNode,
  VisualProfileRelationship,
  VisualRelationship,
  WritableVisualModel
} from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createWaypointsForSelfLoop } from "../dataspecer/visual-model/operation/add-visual-relationship";

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

  const duplicateNode = visualModel.getVisualEntity(duplicatedNodeIdentifier);
  if(duplicateNode === null || !isVisualNode(duplicateNode)) {
    notifications.error("The created duplicate node is not present in visual model for some reason");
    return;
  }

  addRelatedEdgesDuplicatesToVisualModel(
    visualModel, node, duplicateNode);
}

function addRelatedEdgesDuplicatesToVisualModel(
  visualModel: WritableVisualModel,
  originalNode: VisualNode,
  duplicateNode: VisualNode,
) {
  const visualEntities = visualModel.getVisualEntities();
  const allExistingNodeDuplicates = [...visualEntities.values()]
    .filter((visualEntity, _) =>
      isVisualNode(visualEntity) &&
      visualEntity.representedEntity === originalNode.representedEntity &&
      duplicateNode.identifier !== visualEntity.identifier)
    .map(node => node.identifier);

  visualEntities.forEach((visualEntity, _) => {
    if(isVisualRelationship(visualEntity)) {
      addRelationshipDuplicate(
        visualEntity, duplicateNode, allExistingNodeDuplicates, visualModel, "addVisualRelationship");
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      addRelationshipDuplicate(
        visualEntity, duplicateNode, allExistingNodeDuplicates, visualModel, "addVisualProfileRelationship");
    }
  });
}

function addRelationshipDuplicate(
  relationship: VisualRelationship | VisualProfileRelationship,
  duplicateNode: VisualNode,
  allExistingNodeDuplicates: string[],
  visualModel: WritableVisualModel,
  addToVisualModelFunctionName: "addVisualRelationship" | "addVisualProfileRelationship",
) {
  const hasEdgeSourceInDuplicates = allExistingNodeDuplicates.includes(relationship.visualSource);

  if(relationship.visualSource === relationship.visualTarget) {
    // Create just the loop edge. We don't create the loop edge + all the edges between duplicates
    if(hasEdgeSourceInDuplicates) {
      (visualModel[addToVisualModelFunctionName] as ((relationship: any) => string))({
        ...relationship,
        waypoints: [...createWaypointsForSelfLoop(duplicateNode.position)],
        visualSource: duplicateNode.identifier,
        visualTarget: duplicateNode.identifier,
      });
    }
  }
  else {
    const hasEdgeTargetInDuplicates = allExistingNodeDuplicates.includes(relationship.visualTarget);
    if(hasEdgeSourceInDuplicates) {
      (visualModel[addToVisualModelFunctionName] as ((relationship: any) => string))({
        ...relationship,
        waypoints: [],
        visualSource: duplicateNode.identifier
      });
    }
    else if(hasEdgeTargetInDuplicates) {
      (visualModel[addToVisualModelFunctionName] as ((relationship: any) => string))({
        ...relationship,
        waypoints: [],
        visualTarget: duplicateNode.identifier
      });
    }
  }
}