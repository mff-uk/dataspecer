import { VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import {  EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

import type { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { getDomainAndRange } from "../util/relationship-utils";
import { findSourceModelOfEntity } from "../service/model-service";
import { addSemanticGeneralizationToVisualModelAction } from "./add-generalization-to-visual-model";
import { addSemanticRelationshipToVisualModelAction } from "./add-relationship-to-visual-model";
import { addSemanticRelationshipProfileToVisualModelAction } from "./add-relationship-profile-to-visual-model";
import { addSemanticProfileToVisualModelAction } from "./add-profile-to-visual-model";
import { ModelGraphContextType } from "../context/model-context";

/**
 * For given entity make sure, that all related entities
 * are added to the visual model.
 *
 * For example when a second end of relationship is added to the visual model,
 * this function also add the relationship.
 */
export function addRelatedEntitiesAction(
  notifications: UseNotificationServiceWriterType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  entities: AggregatedEntityWrapper[],
  models: Map<string, EntityModel>,
  entity: SemanticModelEntity,
) {
  const identifier = entity.id;
  for (const wrapper of entities) {
    const candidate = wrapper.aggregatedEntity;
    if (candidate === null) {
      continue;
    }
    const model = findSourceModelOfEntity(candidate.id, models);
    if (model === null) {
      continue;
    }
    //
    if (isSemanticModelGeneralization(candidate)) {
      if (shouldAddGeneralization(visualModel, identifier, candidate)) {
        addSemanticGeneralizationToVisualModelAction(
          notifications, graph, visualModel, candidate.id, model.getId());
      }
    }
    if (isSemanticModelRelationship(candidate)) {
      if (shouldAddRelationship(visualModel, identifier, candidate)) {
        addSemanticRelationshipToVisualModelAction(
          notifications, graph, visualModel, candidate.id, model.getId());
      }
    }
    if (isSemanticModelRelationshipUsage(candidate)) {
      if (shouldAddRelationshipUsage(visualModel, identifier, candidate)) {
        addSemanticRelationshipProfileToVisualModelAction(
          notifications, graph, visualModel, candidate.id, model.getId());
      }
    }
    if (isSemanticModelClassUsage(candidate)) {
      if (shouldAddProfile(visualModel, identifier, candidate)) {
        addSemanticProfileToVisualModelAction(
          visualModel, entity, candidate, model.getId());
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
  entity: SemanticModelRelationship,
): boolean {
  const { domain, range } = getDomainAndRange(entity);
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

function shouldAddRelationshipUsage(
  visualModel: VisualModel,
  identifier: string,
  entity: SemanticModelRelationshipUsage,
): boolean {
  const { domain, range } = getDomainAndRange(entity);
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

function shouldAddProfile(
  visualModel: VisualModel,
  identifier: string,
  entity: SemanticModelClassUsage,
): boolean {
  if (entity.id === identifier) {
    // The entity we are adding is a class usage, we need
    // to check for existence of the profiled class.
    return visualModel.getVisualEntityForRepresented(entity.usageOf) !== null;
  } else {
    // Other entity may be specializing our entity.
    if (entity.usageOf === identifier) {
      // We return true if the other is in the visual model.
      return visualModel.getVisualEntityForRepresented(entity.id) !== null;
    }
  }
  return false;
}
