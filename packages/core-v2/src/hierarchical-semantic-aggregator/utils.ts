import { isSemanticModelClass, isSemanticModelRelationship, SemanticModelClass, SemanticModelRelationship } from "../semantic-model/concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "../semantic-model/profile/concepts";
import { isAggregatedEntityInApplicationProfileAggregator } from "./application-profile-aggregator";
import { LocalEntityWrapped } from "./interfaces";

type Profile<T> = T extends SemanticModelClass ? SemanticModelClassProfile : SemanticModelRelationshipProfile;

/**
 * Takes aggregated profile and returns aggregated non-profiles that are closest to the profile.
 */
export function splitProfileToConcepts<T extends SemanticModelClass | SemanticModelRelationship>(profile: LocalEntityWrapped<Profile<T> | T>): LocalEntityWrapped<T>[] {
  if ( // ! we expect you wont mix classes and relationships in the profile
    (
      isSemanticModelClass(profile.aggregatedEntity) &&
      !isSemanticModelClassProfile(profile.aggregatedEntity)
    ) || (
      isSemanticModelRelationship(profile.aggregatedEntity) &&
      !isSemanticModelRelationshipProfile(profile.aggregatedEntity)
    )
  ) {
    return [profile as LocalEntityWrapped<T>];
  }

  if (isAggregatedEntityInApplicationProfileAggregator(profile)) {
    return profile.sources.map(source => splitProfileToConcepts(source as LocalEntityWrapped<Profile<T> | T>)).flat();
  }

  throw new Error("Not a profile we can split.");
}