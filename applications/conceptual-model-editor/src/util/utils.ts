import { SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDomainAndRange } from "./relationship-utils";
import { representCardinality } from "../dialog/utilities/dialog-utilities";
import { SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { getLocalizedStringFromLanguageString } from "./language-utils";
import { getFallbackDisplayName, getNameLanguageString } from "./name-utils";

export const shortenStringTo = (modelId: string | null, length: number = 20) => {
  if (!modelId) {
    return modelId;
  }
  return modelId.length > length ? `...${modelId.substring(modelId.length - (length - 3))}` : modelId;
};

export function compareMaps<T>(oneMap: Map<string, T>, anotherMap: Map<string, T>) {
  if (oneMap.size !== anotherMap.size) {
    return false;
  }
  for (const [key, value] of oneMap) {
    if (anotherMap.get(key) !== value) {
      console.log("maps have differing value for key", key, value, anotherMap.get(key));
      return false;
    }
  }
  return true;
}

/**
 * @returns Returns the entity label which is used in diagram component as the entity label.
 */
export function getEntityLabelToShowInDiagram(
  language: string,
  entity: SemanticModelClass | SemanticModelRelationship |
    SemanticModelClassUsage | SemanticModelRelationshipUsage |
    SemanticModelClassProfile | SemanticModelRelationshipProfile
) {
  return getLocalizedStringFromLanguageString(getNameLanguageString(entity), language)
    ?? getFallbackDisplayName(entity) ?? "";
}

/**
 * @returns Returns attribute's profile label WITHOUT enlisting the labels for the profileOf entities.
 */
export function createAttributeProfileLabel(
  language: string,
  attributeProfile: SemanticModelRelationshipProfile | SemanticModelRelationshipUsage,
) {
  const {range} = getDomainAndRange(attributeProfile);
  const cardinality = representCardinality(range?.cardinality).label;
  const label = getEntityLabelToShowInDiagram(language, attributeProfile) + " [" + cardinality + "]";

  return label;
}

