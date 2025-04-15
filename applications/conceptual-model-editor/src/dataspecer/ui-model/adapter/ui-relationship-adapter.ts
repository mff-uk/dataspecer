import { UiAdapterContext } from "./adapter-context";
import { UI_RELATIONSHIP_TYPE, UiRelationship } from "../model";
import { CmeRelationship } from "../../cme-model";

export const cmeRelationshipToUiRelationship = (
  context: UiAdapterContext,
  entity: CmeRelationship,
): UiRelationship => {
  return {
    type: UI_RELATIONSHIP_TYPE,
    model: entity.model,
    identifier: entity.identifier,
    displayLabel: context.selectLanguageString(entity.name),
    displayDomainCardinality: context.cardinalityToLabel(entity.domainCardinality),
    displayRangeCardinality: context.cardinalityToLabel(entity.rangeCardinality),
  };
};
