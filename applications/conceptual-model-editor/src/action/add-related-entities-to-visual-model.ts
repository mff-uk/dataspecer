import { VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import {  EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { SemanticModelEntity, SemanticModelGeneralization, SemanticModelRelationship, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";

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
  const addingProfile = isSemanticModelClassUsage(entity);
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
    if (addingProfile && isSemanticModelClass(candidate)) {
      // We are adding profile and the entity is a class.
      if (entity.usageOf === candidate.id) {
        addSemanticProfileToVisualModelAction(
          visualModel, candidate, entity, model.getId());
      }
    }
  }
}

function shouldAddGeneralization(
  visualModel: VisualModel,
  identifier: string,
  candidate: SemanticModelGeneralization,
): boolean {
  if (candidate.parent === identifier) {
    return visualModel.getVisualEntityForRepresented(candidate.child) !== null;
  } else if (candidate.child === identifier) {
    return visualModel.getVisualEntityForRepresented(candidate.parent) !== null;
  } else {
    return false;
  }
}

function shouldAddRelationship(
  visualModel: VisualModel,
  identifier: string,
  candidate: SemanticModelRelationship,
): boolean {
  const { domain, range } = getDomainAndRange(candidate);
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
  candidate: SemanticModelRelationshipUsage,
): boolean {
  const { domain, range } = getDomainAndRange(candidate);
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
  candidate: SemanticModelClassUsage,
): boolean {
  if (candidate.id === identifier) {
    // We do not support self profiles.
    return false;
  }
  // The candidate may be specialization of what we are adding.
  if (candidate.usageOf === identifier) {
    // We return true if the other is in the visual model.
    return visualModel.getVisualEntityForRepresented(candidate.id) !== null;
  }
  return false;
}
