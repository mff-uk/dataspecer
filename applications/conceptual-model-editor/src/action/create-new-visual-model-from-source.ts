import { isVisualGroup, isVisualNode, isVisualProfileRelationship, isVisualRelationship, isVisualSuperNode, VisualModel, VisualProfileRelationship, VisualRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { createWritableVisualModel } from "../util/visual-model-utils";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { vi } from "vitest";
import { LanguageString } from "@dataspecer/core/core/core-resource";


/**
 *
 * @param sourceVisualModel Represents the source model from which sohuld be the initial content of the new visual model copied.
 *                          If null, then active visual model is used.
 * @param newVisualModelInitialNodes visual identifiers of the entities copied to the new model.
 * @returns Returns created visual model.
 */
export function createNewVisualModelFromSourceAction(
  notifications: UseNotificationServiceWriterType,
  graph: UseModelGraphContextType,
  sourceVisualModel: VisualModel | null,
  newVisualModelName: LanguageString | null,
  newVisualModelInitialNodes: string[],
  newVisualModelInitialEdges: string[],
) {
  if(sourceVisualModel === null) {
    sourceVisualModel = graph.aggregatorView.getActiveVisualModel();
    if(sourceVisualModel === null) {
      notifications.error("Both source visual model and active visual model are not present");
      return null;
    }
  }

  // FIXME: workaround for having the same color for different views, better to have model colors in a package config or sth
  const activeVisualModel = graph.aggregatorView.getActiveVisualModel();
  const model = createWritableVisualModel();
  if (activeVisualModel) {
    for (const [identifier, data] of activeVisualModel.getModelsData()) {
      model.setModelColor(identifier, data.color ?? "white");
    }
  }
  const oldToNewIdMapping = addNodesFromSourceModelToTargetModel(
    notifications, sourceVisualModel,
    model, newVisualModelInitialNodes);
  addEdgesFromSourceModelToTargetModel(
    notifications, sourceVisualModel, model,
    newVisualModelInitialEdges, oldToNewIdMapping);
  graph.addVisualModel(model);
  model.setLabel(newVisualModelName ?? {en: "DEBUG MODEL LABEL"});
  graph.setAggregatorView(graph.aggregator.getView());

  return model;
}

function addNodesFromSourceModelToTargetModel(
  notifications: UseNotificationServiceWriterType,
  sourceVisualModel: VisualModel,
  targetModel: WritableVisualModel,
  nodesToAdd: string[],
) {
  const oldToNewIdMapping: Record<string, string> = {};
  for (const entityIdentifier of nodesToAdd) {
    const visualEntity = sourceVisualModel.getVisualEntity(entityIdentifier);
    if(visualEntity === null) {
      notifications.error("Invalid visual entity to add to new visual model");
      continue;
    }
    if(isVisualNode(visualEntity)) {
      const newIdentifier = targetModel.addVisualNode({...visualEntity});
      oldToNewIdMapping[visualEntity.identifier] = newIdentifier;
    }
    else if(isVisualSuperNode(visualEntity)) {
      const newIdentifier = targetModel.addVisualSuperNode(visualEntity);
      oldToNewIdMapping[visualEntity.identifier] = newIdentifier;
    }
  }

  return oldToNewIdMapping;
}


function addEdgesFromSourceModelToTargetModel(
  notifications: UseNotificationServiceWriterType,
  sourceVisualModel: VisualModel,
  targetVisualModel: WritableVisualModel,
  edgesToAdd: string[],
  oldNodeIdToNewNodeIdMapping: Record<string, string>,
) {
  // TODO RadStr: DEBUG
  console.info("BEFORE", {edgesToAdd, oldNodeIdToNewNodeIdMapping, targetEntitites: [...targetVisualModel.getVisualEntities().values()]});

  for (const entityIdentifier of edgesToAdd) {
    const visualEntity = sourceVisualModel.getVisualEntity(entityIdentifier);
    if(visualEntity === null) {
      notifications.error("Invalid visual entity to add to new visual model");
      continue;
    }
    if(isVisualRelationship(visualEntity)) {
      const sourceDEBUG = sourceVisualModel.getVisualEntity(visualEntity.visualSource);
      const targetDEBUG = sourceVisualModel.getVisualEntity(visualEntity.visualTarget);
      if((sourceDEBUG !== null && isVisualSuperNode(sourceDEBUG)) || (targetDEBUG !== null && isVisualSuperNode(targetDEBUG))) {
        alert("Indeed there is super node on end");
      }
      const newVisualRelationship = createNewRelationship(visualEntity, oldNodeIdToNewNodeIdMapping);
      if(newVisualRelationship === null) {
        continue;
      }
      targetVisualModel.addVisualRelationship(newVisualRelationship);
    }
    else if(isVisualProfileRelationship(visualEntity)) {
      const newVisualProfileRelationship = createNewRelationship(visualEntity, oldNodeIdToNewNodeIdMapping);
      if(newVisualProfileRelationship === null) {
        continue;
      }
      targetVisualModel.addVisualProfileRelationship(newVisualProfileRelationship);
    }
  }

  // TODO RadStr: DEBUG
  console.info("AFTER", {edgesToAdd, oldNodeIdToNewNodeIdMapping, targetEntitites: [...targetVisualModel.getVisualEntities().values()]});
}

function createNewRelationship<T extends Omit<VisualRelationship, "identifier" | "type"> | Omit<VisualProfileRelationship, "identifier" | "type">>(
  oldVisualRelationship: T,
  oldNodeIdToNewNodeIdMapping: Record<string, string>,
): T | null {
  const newVisualRelationship = {
    ...oldVisualRelationship,
    visualSource: oldNodeIdToNewNodeIdMapping[oldVisualRelationship.visualSource],
    visualTarget: oldNodeIdToNewNodeIdMapping[oldVisualRelationship.visualTarget],
  };

  if(newVisualRelationship.visualSource === undefined || newVisualRelationship.visualTarget === undefined) {
    return null;
  }

  return newVisualRelationship;
}
