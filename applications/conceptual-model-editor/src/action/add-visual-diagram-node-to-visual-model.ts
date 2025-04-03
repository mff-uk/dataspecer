import {
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isVisualDiagramNode,
  VisualModel,
  VisualDiagramNode,
  WritableVisualModel
} from "@dataspecer/core-v2/visual-model";
import {
  getClassesAndDiagramNodesModelsFromVisualModelRecursively,
  getViewportCenterForClassPlacement,
} from "./utilities";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createNewVisualModelAction } from "./create-new-visual-model-from-source-visual-model";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { removeFromVisualModelByVisualAction } from "./remove-from-visual-model-by-visual";
import { UseDiagramType } from "@/diagram/diagram-hook";

export function addVisualDiagramNodeForNewModelToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  useGraph: UseModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  label: LanguageString | null,
  description: LanguageString | null,
  newVisualModelName: LanguageString | null,
  containedNodes: string[],
  containedEdges: string[],
): string | null {

  const createdVisualModel = createNewVisualModelAction(
    notifications, graph, useGraph, visualModel, newVisualModelName, containedNodes, containedEdges);
  if(createdVisualModel === null) {
    notifications.error("Failed to create new visual model, so we can not create visual diagram node referencing it.");
    return null;
  }

  // Just use the center of screen instead of layouting, User will want to play with it anyways.
  const position = getViewportCenterForClassPlacement(diagram);

  const visualDiagramNode: Omit<VisualDiagramNode, "identifier" | "type"> = {
    label: label ?? {en: "visual diagram node"},
    description: description ?? {en: ""},
    position: {
      ...position,
      anchored: null
    },
    representedVisualModel: createdVisualModel.getIdentifier(),
  };
  const visualDiagramNodeIdentifier = visualModel.addVisualDiagramNode(visualDiagramNode);

  rerouteAllRelevantEdgesTotheVisualDiagramNode(
    notifications, visualModel, visualDiagramNodeIdentifier,
    containedNodes);
  containedNodes.forEach(node => {
    visualModel.deleteVisualEntity(node);
  });

  console.info(visualModel.getVisualEntities());        // TODO RadStr: DEBUG
  return visualDiagramNodeIdentifier;
}

// TODO RadStr: SUPER - Maybe does not work with multiple visual entities

/**
 * Reroutes all edges which were pointing to or from the nodes newly contained in {@link visualModelWithVisualDiagramNode}.
 */
function rerouteAllRelevantEdgesTotheVisualDiagramNode(
  notifications: UseNotificationServiceWriterType,
  visualModelWithVisualDiagramNode: WritableVisualModel,
  visualDiagramNode: string,
  nodesInsideTheVisualDiagramNode: string[],
) {
  const edgesToRemove: string[] = [];
  const edgesToUpdate: {
    visualSource: string,
    visualTarget: string,
    edgeIdentifier: string
  }[] = [];
  for (const [_, visualEntity] of visualModelWithVisualDiagramNode.getVisualEntities()) {
    if(isVisualRelationship(visualEntity) || isVisualProfileRelationship(visualEntity)) {
      const isSourceInsideVisualDiagramNode = nodesInsideTheVisualDiagramNode.includes(visualEntity.visualSource);
      const isTargetInsideVisualDiagramNode = nodesInsideTheVisualDiagramNode.includes(visualEntity.visualTarget);
      if (isSourceInsideVisualDiagramNode && isTargetInsideVisualDiagramNode) {
        // Both ends are inside the newly created visual model representing visual diagram node, so we have to delete it
        edgesToRemove.push(visualEntity.identifier);
      }
      else if (isSourceInsideVisualDiagramNode && !isTargetInsideVisualDiagramNode) {
        edgesToUpdate.push({
          visualSource: visualDiagramNode,
          visualTarget: visualEntity.visualTarget,
          edgeIdentifier: visualEntity.identifier
        });
      }
      else if (!isSourceInsideVisualDiagramNode && isTargetInsideVisualDiagramNode) {
        edgesToUpdate.push({
          visualSource: visualEntity.visualSource,
          visualTarget: visualDiagramNode,
          edgeIdentifier: visualEntity.identifier
        });
      }
    }
  }

  removeFromVisualModelByVisualAction(notifications, visualModelWithVisualDiagramNode, edgesToRemove);
  for(const {edgeIdentifier, visualSource, visualTarget} of edgesToUpdate) {
    visualModelWithVisualDiagramNode.updateVisualEntity(edgeIdentifier, {visualSource, visualTarget});
  }
}

/**
 * Removes all {@link VisualNode}s and all {@link VisualDiagramNode}s contained in given
 * visual model identified by {@link visualModelWithNodesToBeRemoved}.
 * @deprecated We actually want to remove exactly the nodes given on input, we don't want to perform recursive removal
 */
function removeAllNodesContainedInGivenVisualModel(
  availableVisualModels: VisualModel[],
  visualModelToModify: WritableVisualModel,
  visualModelWithNodesToBeRemoved: string,
) {
  const allNodesToBeRemovedFromVisualModel = getClassesAndDiagramNodesModelsFromVisualModelRecursively(availableVisualModels, visualModelWithNodesToBeRemoved);
  // Remove the nodes explicitly, because we don't want to remove the surrounding edges as it is done in the action
  for(const nodeToBeRemoved of allNodesToBeRemovedFromVisualModel) {
    const nodes = visualModelToModify.getVisualEntitiesForRepresented(nodeToBeRemoved);
    for (const node of nodes) {
      if(node !== null) {
        if(isVisualNode(node) || isVisualDiagramNode(node)) {
          visualModelToModify.deleteVisualEntity(node.identifier);
        }
      }
    }
  }
}
