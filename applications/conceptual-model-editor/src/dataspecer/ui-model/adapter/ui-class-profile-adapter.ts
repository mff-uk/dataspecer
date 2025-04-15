import { UI_CLASS_PROFILE_TYPE, UiClassProfile, UiReference } from "../model";
import { UiAdapterContext } from "./adapter-context";
import { CmeClassAggregate } from "../../cme-model/model";

export const cmeClassAggregateToUiClassProfile = (
  context: UiAdapterContext,
  entity: CmeClassAggregate,
): UiClassProfile => {

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
    type: UI_CLASS_PROFILE_TYPE,
    model: entity.model,
    identifier: entity.identifier,
    iri: entity.iri ?? "",
    displayLabel: context.selectDisplayLabel(entity),
    displayDescription: context.selectLanguageString(entity.description),
    displayUsageNode: context.selectLanguageString(entity.usageNote),
    profiling,
  };
};
