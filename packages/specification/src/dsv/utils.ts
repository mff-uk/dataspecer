import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

/**
 * Helper function that check whether the model is a vocabulary. If not, it is probably an application profile.
 */
export function isModelVocabulary(model: Record<string, SemanticModelEntity>): boolean {
  return Object.values(model).some((entity) => isSemanticModelClass(entity) || isSemanticModelRelationship(entity));
}
/**
 * Helper function that check whether the model is an application profile. If not, it is probably a vocabulary.
 */
export function isModelProfile(model: Record<string, SemanticModelEntity>): boolean {
  return Object.values(model).some((entity) => isSemanticModelClassProfile(entity) || isSemanticModelRelationshipProfile(entity));
}
