import { UiAdapterContext } from "./adapter-context";
import { UI_RELATIONSHIP_PROFILE_TYPE, UiReference, UiRelationshipProfile } from "../model";
import { CmeRelationshipAggregate } from "../../cme-model";

export const cmeRelationshipAggregateToUiRelationshipProfile = (
  context: UiAdapterContext,
  entity: CmeRelationshipAggregate,
): UiRelationshipProfile => {

  const profiling: UiReference[] = [];
  for (const profileOf of entity.profileOf) {
    for (const model of context.selectModels(profileOf)) {
      profiling.push({
        identifier: profileOf,
        model,
      });
    }
  }

  return {
    type: UI_RELATIONSHIP_PROFILE_TYPE,
    model: entity.model,
    identifier: entity.identifier,
    displayLabel: context.selectLanguageString(entity.name),
    displayDomainCardinality: context.cardinalityToLabel(entity.domainCardinality),
    displayRangeCardinality: context.cardinalityToLabel(entity.rangeCardinality),
    displayUsageNote: context.selectLanguageString(entity.usageNote),
    profiling,
  };
};
