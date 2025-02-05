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
import { addSemanticProfileToVisualModelAction as addSemanticUsageToVisualModelAction } from "./add-profile-to-visual-model";
import { ModelGraphContextType } from "../context/model-context";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

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
  const addingUsage = isSemanticModelClassUsage(entity);
  const addingProfile = isSemanticModelClassProfile(entity);
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
    if (isSemanticModelRelationshipUsage(candidate) || isSemanticModelRelationshipProfile(candidate)) {
      if (shouldAddRelationshipUsageOrProfile(visualModel, identifier, candidate)) {
        addSemanticRelationshipProfileToVisualModelAction(
          notifications, graph, visualModel, candidate.id, model.getId());
      }
    }
    if (isSemanticModelClassUsage(candidate)) {
      if (shouldAddUsage(visualModel, identifier, candidate)) {
        // "candidate" is profile of "identifier"
        addSemanticUsageToVisualModelAction(
          visualModel, entity, candidate, model.getId());
      } else if (addingUsage && shouldAddUsage(visualModel, candidate.id, entity)) {
        // "identifier" is profile of "candidate"
        addSemanticUsageToVisualModelAction(
          visualModel, candidate, entity, model.getId());
      }
    }
    if (addingUsage && isSemanticModelClass(candidate)) {
      // We are adding usage, candidate is a class, it could profiled class.
      if (entity.usageOf === candidate.id) {
        addSemanticUsageToVisualModelAction(
          visualModel, candidate, entity, model.getId());
      }
    }
    if (isSemanticModelClassProfile(candidate)) {
      if (shouldAddProfile(visualModel, identifier, candidate)) {
        // "candidate" is profile of "identifier"
        addSemanticUsageToVisualModelAction(
          visualModel, entity, candidate, model.getId());
      } else if (addingProfile && shouldAddProfile(visualModel, candidate.id, entity)) {
        // "identifier" is profile of "candidate"
        addSemanticUsageToVisualModelAction(
          visualModel, candidate, entity, model.getId());
      }
    }
    if (addingProfile && isSemanticModelClass(candidate)) {
      // We are adding profile, candidate is a class, it could profiled class.
      if (entity.profiling.includes(candidate.id)) {
        addSemanticUsageToVisualModelAction(
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

function shouldAddRelationshipUsageOrProfile(
  visualModel: VisualModel,
  identifier: string,
  candidate: SemanticModelRelationshipUsage | SemanticModelRelationshipProfile,
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

function shouldAddUsage(
  visualModel: VisualModel,
  profiled: string,
  profile: SemanticModelClassUsage,
): boolean {
  if (profile.id === profiled) {
    // We do not support self profiles.
    return false;
  }
  // The candidate may be specialization of what we are adding.
  if (profile.usageOf === profiled) {
    // We return true if the other is in the visual model.
    return visualModel.getVisualEntityForRepresented(profile.id) !== null;
  }
  return false;
}

function shouldAddProfile(
  visualModel: VisualModel,
  profiled: string,
  profile: SemanticModelClassProfile,
): boolean {
  if (profile.id === profiled) {
    // We do not support self profiles.
    return false;
  }
  // The candidate may be specialization of what we are adding.
  if (profile.profiling.includes(profiled)) {
    // We return true if the other is in the visual model.
    return visualModel.getVisualEntityForRepresented(profile.id) !== null;
  }
  return false;
}

