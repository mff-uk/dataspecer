import { EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { isVisualNode, isVisualRelationship, VisualEntity, VisualNode, VisualRelationship, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { findSourceModelOfEntity } from "../service/model-service";

/**
 * Given visual model in version 0 performs migration to version 1
 * changing content of the model.
 */
export function migrateVisualModelFromV0(
  models: Map<string, EntityModel>,
  entities: Record<string, AggregatedEntityWrapper>,
  visualModel: WritableVisualModel,
) {
  for (const entity of visualModel.getVisualEntities().values()) {
    if (isVisualNode(entity)) {
      migrateVisualNode(entities, models, visualModel, entity);
    } else if (isVisualRelationship(entity)) {
      migrateVisualRelationship(entities, models, visualModel, entity);
    }
  }

  removeUnusedModelData(models, visualModel);
}

function migrateVisualNode(
  entities: Record<string, AggregatedEntityWrapper>,
  models: Map<string, EntityModel>,
  visualModel: WritableVisualModel,
  entity: VisualNode,
) {
  // Remove if there is no represented entity.
  const represented = entities[entity.representedEntity];
  if (represented === undefined) {
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // Check entity is in a model.
  // We should always find a model, but we need to
  // deal with situation when it does not happen.
  const representedModel = findSourceModelOfEntity(represented.id, models);
  if (representedModel === null) {
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // Check visual node represents class or class profile.
  // In addition we need to add a profile relation for a profile.
  const representedEntity = represented.aggregatedEntity;
  if (isSemanticModelClass(representedEntity)) {
    // This is ok.
  } else if (isSemanticModelClassUsage(representedEntity)) {
    // It is a profile.
    const usageOf = entities[representedEntity.usageOf];
    const usageVisual = visualModel.getVisualEntityForRepresented(usageOf.id);
    if (usageVisual === null) {
      // There is no visual representation.
    } else {
      // There is a visual representation, we add a relation.
      visualModel.addVisualProfileRelationship({
        entity: representedEntity.id,
        model: representedModel.getId(),
        waypoints: [],
      });
    }
  } else {
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // We add new information that was missing in the previous model version.
  visualModel.updateVisualEntity(
    entity.identifier, { model: representedModel.getId() });
}

function migrateVisualRelationship(
  entities: Record<string, AggregatedEntityWrapper>,
  models: Map<string, EntityModel>,
  visualModel: WritableVisualModel,
  entity: VisualRelationship,
) {
  // Remove if there is no represented entity.
  const represented = entities[entity.representedRelationship];
  if (represented === undefined) {
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // Check entity is in a model.
  // We should always find a model, but we need to
  // deal with situation when it does not happen.
  const representedModel = findSourceModelOfEntity(represented.id, models);
  if (representedModel === null) {
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // We check that relationship represents a relationship.
  // Instead of a positive check, we use a negative one, so we
  // check for representation of non-relations.
  const representedEntity = represented.aggregatedEntity;
  if (isSemanticModelClass(representedEntity)
    || isSemanticModelClassUsage(representedEntity)) {
    // Type miss match.
    visualModel.deleteVisualEntity(entity.identifier);
    return;
  }

  // We add new information that was missing in the previous model version.
  visualModel.updateVisualEntity(
    entity.identifier, { model: representedModel.getId() });
}

/**
 * Model v0 saved does not removed data about semantic
 * models once they have been removed.
 *
 * To keep the visual model clean, we remove information
 * about all missing models.
 */
function removeUnusedModelData(
  models: Map<string, EntityModel>,
  visualModel: WritableVisualModel,
) {
  for (const [identifier, _] of visualModel.getModelsData()) {
    if (models.has(identifier)) {
      continue;
    }
    // The model is missing, we delete the information.
    visualModel.deleteModelData(identifier);
  }
}