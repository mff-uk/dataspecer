import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { sourceModelOfEntity } from "../util/model-utils";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { addSemanticClassToVisualModelAction } from "./add-class-to-visual-model";
import { addSemanticClassProfileToVisualModelAction } from "./add-class-profile-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { Entity, EntityModel } from "@dataspecer/core-v2";
import { ClassesContextType } from "../context/classes-context";
import { XY } from "@dataspecer/layout";
import { findPositionForNewNodesUsingLayouting } from "./layout-visual-model";

export type EntityToAddToVisualModel = {
    /**
     * Identifies the semantic entity to be added to visual model.
     */
    identifier: string,
    /**
     * The position to put the newly created visual entity at if the position is null or undefined then default placement is chosen based on type of entity.
     */
    position?: XY | null
};

type ValidatedDataAboutEntity = {
    entity: Entity;
    model: EntityModel;
    position: XY | null;
};

export async function addSemanticEntitiesToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  entities: EntityToAddToVisualModel[],
) {
  const validatedEntitiesToAddToVisualModel: ValidatedDataAboutEntity[] = getValidatedDataAboutEntities(
    notifications, graph, visualModel, entities);
  const {nodes, edges} = await splitIntoNodesAndEdgesAndUpdatePositions(
    notifications, classes, graph, visualModel, diagram, validatedEntitiesToAddToVisualModel);
  // Add to visual model
  await addClassesAndClassProfilesToVisualModel(notifications, classes, graph, visualModel, diagram, nodes);
  addConnectionsToVisualModel(notifications, graph, visualModel, edges);
}

async function splitIntoNodesAndEdgesAndUpdatePositions(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  validatedEntitiesToAddToVisualModel: ValidatedDataAboutEntity[]
) {
  let nodePositions: Record<string, XY> = {};
  const classAndClassProfilesToFindPositionsFor: string[] = [];
  const nodes: ValidatedDataAboutEntity[] = [];
  const edges: ValidatedDataAboutEntity[] = [];

  for(const validatedEntityToAddToVisualModel of validatedEntitiesToAddToVisualModel) {
    const {entity, position} = validatedEntityToAddToVisualModel
    if(isSemanticModelClass(entity)) {
      if(position === null) {
        classAndClassProfilesToFindPositionsFor.push(entity.id);
      }
      else {
        nodePositions[entity.id] = position;
      }
      nodes.push(validatedEntityToAddToVisualModel);
    }
    else if(isSemanticModelClassUsage(entity)) {
      if(position === null) {
        classAndClassProfilesToFindPositionsFor.push(entity.id);
      }
      else {
        nodePositions[entity.id] = position;
      }
      nodes.push(validatedEntityToAddToVisualModel);
    }
    else if(isSemanticModelRelationship(entity) ||
            isSemanticModelRelationshipUsage(entity) ||
            isSemanticModelGeneralization(entity)) {
      edges.push(validatedEntityToAddToVisualModel);
    }
    else {  // Maybe unnecessary
      notifications.error("The added semantic entity is of unknown type within the semantic model");
    }
  }

  const positionsFoundThroughLayouting = await findPositionForNewNodesUsingLayouting(
    notifications, diagram, graph, visualModel, classes, classAndClassProfilesToFindPositionsFor);
  nodePositions = {
    ...nodePositions,
    ...positionsFoundThroughLayouting,
  };
  for (const nodeData of nodes) {
    nodeData.position = nodePositions[nodeData.entity.id];
  }

  return {
    nodes,
    edges,
  };
}

function getValidatedDataAboutEntities(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entities: EntityToAddToVisualModel[]
) {
  const validatedEntitiesToAddToVisualModel: ValidatedDataAboutEntity[] = [];
  for (const entityToAddToVisualModel of entities) {
    const entityIdentifier = entityToAddToVisualModel.identifier;
    const position = entityToAddToVisualModel.position ?? null;

    const isAlreadyInVisualModel = visualModel.getVisualEntitiesForRepresented(entityIdentifier) !== null;
    if(isAlreadyInVisualModel) {
      continue;
    }

    const model = sourceModelOfEntity(entityIdentifier, [...graph.models.values()]);
    if(model === undefined) {
      // Note that we continue, therefore if one entity fails, the addition of rest is not affected.
      notifications.error(`The entity ${entityIdentifier} which should have been added to visual model doesn't have source semantic model`);
      continue;
    }

    const entity = model.getEntities()[entityIdentifier];
    if(entity === undefined) {      // Probably should not happen ever.
      notifications.error(`The entity ${entityIdentifier} can't be found in the relevant model`);
      continue;
    }
    validatedEntitiesToAddToVisualModel.push({entity, model, position});
  }

  return validatedEntitiesToAddToVisualModel;
}

async function addClassesAndClassProfilesToVisualModel(
  notifications: UseNotificationServiceWriterType,
  classes: ClassesContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  diagram: UseDiagramType,
  validatedNodesData: ValidatedDataAboutEntity[]
) {
  for(const {entity, model, position} of validatedNodesData) {
    const modelIdentifier = model.getId();
    if(isSemanticModelClass(entity)) {
      await addSemanticClassToVisualModelAction(
        notifications, graph, classes, visualModel, diagram, entity.id, modelIdentifier, position);
    }
    else {
      await addSemanticClassProfileToVisualModelAction(
        notifications, graph, classes, visualModel, diagram, entity.id, modelIdentifier, position);
    }
  }
}

function addConnectionsToVisualModel(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  validatedEdgesData: ValidatedDataAboutEntity[]
) {
  for(const {entity, model} of validatedEdgesData) {
    const modelIdentifier = model.getId();
    if(isSemanticModelRelationship(entity)) {
      addSemanticRelationshipToVisualModelAction(
        notifications, graph, visualModel, entity.id, modelIdentifier, null, null);
    }
    else if(isSemanticModelRelationshipUsage(entity)) {
      addSemanticRelationshipProfileToVisualModelAction(
        notifications, graph, visualModel, entity.id, modelIdentifier, null, null);
    }
    else if(isSemanticModelGeneralization(entity)) {
      addSemanticGeneralizationToVisualModelAction(notifications, graph, visualModel, entity.id, modelIdentifier);
    }
  }
}
