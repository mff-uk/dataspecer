import { Entity, EntityIdentifier } from "../../../entity-model/entity";
import { SemanticModelClass, SemanticModelRelationship } from "../../concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "../concepts";

/**
 * Given an entity analyze and return dependencies to other entities.
 */
export interface DependencyAnalyzer {

  /**
   * @returns Null it the entity is not known to the analyzer.
   */
  dependencies(entity: Entity) : EntityIdentifier[] | null;

}

export interface ProfileAggregator {

  aggregateSemanticModelClassProfile(
    profile: SemanticModelClassProfile,
    aggregatedProfiled: (SemanticModelClassProfile | SemanticModelClass)[],
  ) : SemanticModelClassProfile;

  aggregateSemanticModelRelationshipProfile(
    profile: SemanticModelRelationshipProfile,
    aggregatedProfiled: (SemanticModelRelationshipProfile | SemanticModelRelationship)[],
  ): SemanticModelRelationshipProfile;

}

export interface ProfileEntityAggregator extends DependencyAnalyzer, ProfileAggregator {

}

class DefaultProfileEntityAggregator implements ProfileEntityAggregator {

  dependencies(entity: Entity): EntityIdentifier[] | null {
    if (isSemanticModelClassProfile(entity)) {
      return entity.profiling;
    }
    if (isSemanticModelRelationshipProfile(entity)) {
      return entity.profiling;
    }
    return null;
  }

  aggregateSemanticModelClassProfile(
    profile: SemanticModelClassProfile,
    aggregatedProfiled: (SemanticModelClassProfile | SemanticModelClass)[],
  ): SemanticModelClassProfile {

  }

  aggregateSemanticModelRelationshipProfile(
    profile: SemanticModelRelationshipProfile,
    aggregatedProfiled: (SemanticModelRelationshipProfile | SemanticModelRelationship)[],
  ): SemanticModelRelationshipProfile {

  }

}

export function createDefaultProfileEntityAggregator() : ProfileEntityAggregator {
  return new DefaultProfileEntityAggregator();
}
