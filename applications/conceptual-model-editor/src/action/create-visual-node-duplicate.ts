import {
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  Position,
  VisualNode,
  VisualProfileRelationship,
  VisualRelationship,
  WritableVisualModel
} from "@dataspecer/core-v2/visual-model";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createWaypointsForSelfLoop } from "../dataspecer/visual-model/operation/add-visual-relationships";
import { UseDiagramType } from "../diagram/diagram-hook";
import { placeCoordinateOnGrid } from "@dataspecer/layout";
import { configuration } from "../application";

// TODO RadStr: I don't want to copy the docs of the react binding here - create issue for it later.
/**
 * @param nodeIdentifier is the identifier of the node to create duplicate of
 * @returns Returns identifier of the created node, or null if the action failed
 */
export function createVisualNodeDuplicateAction(
  notifications: UseNotificationServiceWriterType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodeIdentifier: string,
): string | null {
  const node = visualModel.getVisualEntity(nodeIdentifier);
  if(node === null) {
    notifications.error("Unable to find source node to create duplicate of");
    return null;
  }
  if(!isVisualNode(node)) {
    notifications.error("The given node to create duplicate of is not a node");
    return null;
  }

  const position: Position = {
    x: placeCoordinateOnGrid(node.position.x -
      (diagram.actions().getNodeWidth(nodeIdentifier) ?? 0), configuration().xSnapGrid),
    y: node.position.y,
    anchored: node.position.anchored
  };

  const duplicatedNodeIdentifier = visualModel.addVisualNode({
    ...node,
    position: position,
  });

  const duplicateNode = visualModel.getVisualEntity(duplicatedNodeIdentifier);
  if(duplicateNode === null || !isVisualNode(duplicateNode)) {
    notifications.error("The created duplicate node is not present in visual model for some reason");
    return null;
  }

  addRelatedEdgesDuplicatesToVisualModel(
    visualModel, node, duplicateNode);

  return duplicatedNodeIdentifier;
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

  const alreadyAddedRepresentedEdges: Record<string, true> = {};

  visualEntities.forEach((visualEntity, _) => {
    if(isVisualRelationship(visualEntity)) {
      if(alreadyAddedRepresentedEdges[visualEntity.representedRelationship]) {
        return;
      }
      alreadyAddedRepresentedEdges[visualEntity.representedRelationship] = true;

      addRelationshipDuplicate(
        visualEntity, duplicateNode, allExistingNodeDuplicates, visualModel, "addVisualRelationship");
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      if(alreadyAddedRepresentedEdges[visualEntity.entity]) {
        return;
      }
      alreadyAddedRepresentedEdges[visualEntity.entity] = true;

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
        waypoints: createWaypointsForSelfLoop(duplicateNode.position),
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