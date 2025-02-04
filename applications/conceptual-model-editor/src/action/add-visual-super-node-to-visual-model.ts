import { isVisualNode, isVisualProfileRelationship, isVisualRelationship, isVisualSuperNode, VisualModel, VisualProfileRelationship, VisualRelationship, VisualSuperNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { getNodesAndSuperNodesFromVisualModelRecursively, getSuperNodeMappings, getVisualSourceAndTargetForEdge } from "./utilities";
import { UseModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createNewVisualModelFromSourceAction } from "./create-new-visual-model-from-source";
import { removeFromVisualModelAction } from "./remove-from-visual-model";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

export function addVisualSuperNodeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: UseModelGraphContextType,
  visualModel: WritableVisualModel,
  label: LanguageString | null,
  description: LanguageString | null,
  newVisualModelName: LanguageString | null,
  containedNodes: string[],
  containedEdges: string[],
): string | null {

  // TODO RadStr: ... Again calling action
  const createdVisualModel = createNewVisualModelFromSourceAction(
    notifications, graph, visualModel, newVisualModelName, containedNodes, containedEdges);
  if(createdVisualModel === null) {
    notifications.error("Failed to create new visual model, so we can not create super node referencing it.");
    return null;
  }

  // TODO RadStr: Put the model away
  const visualSuperNode: Omit<VisualSuperNode, "identifier" | "type"> = {
    label: label ?? {en: "visual super node"},
    description: description ?? {en: ""},
    model: "",
    position: {
      x: 0,
      y: 0,
      anchored: null
    },
    content: [],
    visualModels: [createdVisualModel.getIdentifier()],
  };
  const superNodeIdentifier = visualModel.addVisualSuperNode(visualSuperNode);

  const availableVisualModels = graph.aggregatorView.getAvailableVisualModels();
  const { nodeToSuperNodeMapping } = getSuperNodeMappings(availableVisualModels, visualModel);
  // We want only the nodes mapped to the newly created super node.

  for(const [node, superNode] of Object.entries(nodeToSuperNodeMapping)) {
    if(superNode !== superNodeIdentifier) {
      delete nodeToSuperNodeMapping[node];
    }
  }

  rerouteAllRelevantEdgesTotheSuperNode(notifications, visualModel, nodeToSuperNodeMapping);
  removeAllNodesContainedInGivenVisualModel(availableVisualModels, visualModel, createdVisualModel.getIdentifier());

  console.info(visualModel.getVisualEntities());        // TODO RadStr: DEBUG
  return superNodeIdentifier;
}


// TODO RadStr: Put into separate file
/**
 * Creates new super node, which is referencing existing visual model {@link existingModel}.
 * The newly created super node is put into the {@link visualModelToAddTo}
 * @returns The identifier of the created super node.
 */
export function addSuperNodeForExistingModelToVisualModelAction(
  visualModelToAddTo: WritableVisualModel,
  label: LanguageString,
  description: LanguageString,
  existingModel: string,
): string {
  const visualSuperNode: Omit<VisualSuperNode, "identifier" | "type"> = {
    label: label ?? {en: "visual super node"},
    description: description ?? {en: ""},
    model: "",
    position: {
      x: 0,
      y: 0,
      anchored: null
    },
    content: [],
    visualModels: [existingModel],
  };

  const superNodeIdentifier = visualModelToAddTo.addVisualSuperNode(visualSuperNode);
  console.info(visualModelToAddTo.getVisualEntities());     // TODO RadStr: DEBUG
  return superNodeIdentifier;
}

/**
 * Reroutes all edges which were pointing into or from the nodes newly contained in the super node.
 */
function rerouteAllRelevantEdgesTotheSuperNode(
  notifications: UseNotificationServiceWriterType,
  visualModelWithSuperNode: WritableVisualModel,
  nodeToSuperNodeMapping: Record<string, string>
) {
  const edgesToRemove: string[] = [];
  const edgesToUpdate: {
    visualSource: string,
    visualTarget: string,
    edgeIdentifier: string
  }[] = [];
  for (const [_, visualEntity] of visualModelWithSuperNode.getVisualEntities()) {
    if(isVisualRelationship(visualEntity) || isVisualProfileRelationship(visualEntity)) {
      const { source: visualSource, target: visualTarget } = getVisualSourceAndTargetForEdge(
        visualModelWithSuperNode, visualEntity, nodeToSuperNodeMapping);
        if(visualSource !== visualEntity.visualSource && visualTarget !== visualEntity.visualTarget) {
        // Both ends are inside the newly created visual model reperesenting super node, so we have to delete it
        edgesToRemove.push(visualEntity.identifier);
      }
      else if(visualSource !== visualEntity.visualSource || visualTarget !== visualEntity.visualTarget) {
        // At least one of the ends is inside the newly created visual model
        edgesToUpdate.push({visualSource, visualTarget, edgeIdentifier: visualEntity.identifier});
      }
    }
  }

  // TODO RadStr: Action in action
  console.info("edgesToRemove", edgesToRemove);
  removeFromVisualModelAction(notifications, visualModelWithSuperNode, edgesToRemove, true);
  for(const {edgeIdentifier, visualSource, visualTarget} of edgesToUpdate) {
    visualModelWithSuperNode.updateVisualEntity(edgeIdentifier, {visualSource, visualTarget});
  }
}

/**
 * Removes all {@link VisualNode}s and all {@link VisualSuperNode}s contained in given
 * super node identified by {@link superNodeIdentifier}.
 */
function removeAllNodesContainedInGivenVisualModel(
  availableVisualModels: VisualModel[],
  visualModelToModify: WritableVisualModel,
  visualModelWithNodesToBeRemoved: string,
) {
  const allNodesToBeRemovedFromVisualModel = getNodesAndSuperNodesFromVisualModelRecursively(availableVisualModels, visualModelWithNodesToBeRemoved);
  // Remove the nodes explicitly, because we don't want to remove the surrounding edges as it is done in the action
  for(const nodeToBeRemoved of allNodesToBeRemovedFromVisualModel) {
    const node = visualModelToModify.getVisualEntityForRepresented(nodeToBeRemoved);
    if(node !== null) {
      if(isVisualNode(node) || isVisualSuperNode(node)) {
        visualModelToModify.deleteVisualEntity(node.identifier);
      }
    }
  }
}