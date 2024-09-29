import { isWritableVisualModel, type VisualModel } from "@dataspecer/core-v2/visual-model";
import type { ModelGraphContextType } from "../context/model-context";
import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { addRelationToVisualModelAction } from "./add-relation-to-visual-model";
import { findSourceModelOfEntity } from "../service/model-service";
import { getDomainAndRange } from "../service/relationship-service";
import type { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import type { EntityModel } from "@dataspecer/core-v2";

/**
 * Add resource to the visual model and by doing so to the canvas as well.
 *
 * @param notifications
 * @param graph
 * @param modelIdentifier Owner of the entity to add visual representation for.
 * @param identifier Identifier of semantic entity to add visual representation for.
 * @param position
 */
export function addNodeToVisualModelAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  modelIdentifier: string,
  identifier: string,
  position: { x: number, y: number },
) {
  const visualModel = graph.aggregatorView.getActiveVisualModel();
  if (visualModel === null) {
    notifications.error("There is no active visual model.");
    return;
  }
  if (!isWritableVisualModel(visualModel)) {
    notifications.error("Visual model is not writable.");
    return;
  }
  //
  visualModel.addVisualNode({
    model: modelIdentifier,
    representedEntity: identifier,
    position: {
      x: position.x,
      y: position.y,
      anchored: null,
    },
    content: [],
    visualModels: [],
  });
  // We need to add all relations.
  const models = graph.models;
  const entities = Object.values(graph.aggregatorView.getEntities());
  addRelationships(notifications, graph, visualModel, identifier, entities, models);
}

function addRelationships(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: VisualModel,
  identifier: string,
  entities: AggregatedEntityWrapper[],
  models: Map<string, EntityModel>,
) {
  for (const wrapper of entities) {
    const entity = wrapper.aggregatedEntity;
    if (entity === null) {
      continue;
    }
    const model = findSourceModelOfEntity(entity.id, models);
    if (model === null) {
      continue;
    }
    //
    if (isSemanticModelGeneralization(entity)) {
      if (shouldAddGeneralization(visualModel, identifier, entity)) {
        addRelationToVisualModelAction(notifications, graph, model.getId(), entity.id);
      }
    }
    if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
      if (shouldAddRelationship(visualModel, identifier, entity)) {
        addRelationToVisualModelAction(notifications, graph, model.getId(), entity.id);
      }
    }
  }
}

function shouldAddGeneralization(
  visualModel: VisualModel,
  identifier: string,
  entity: SemanticModelGeneralization,
): boolean {
  if (entity.parent === identifier) {
    return visualModel.getVisualEntityForRepresented(entity.child) !== null;
  } else if (entity.child === identifier) {
    return visualModel.getVisualEntityForRepresented(entity.parent) !== null;
  } else {
    return false;
  }
}

function shouldAddRelationship(
  visualModel: VisualModel,
  identifier: string,
  entity: SemanticModelRelationship | SemanticModelRelationshipUsage,
): boolean {
  const {domain, range} = getDomainAndRange(entity);
  if (domain?.concept === identifier) {
    const other = range?.concept ?? null;
    return other !== null && visualModel.getVisualEntityForRepresented(other) !== null;
  } else if (range?.concept === identifier) {
    const other = domain?.concept ?? null;
    return other !== null && visualModel.getVisualEntityForRepresented(other) !== null;
  } else {
    return false;
  }
}