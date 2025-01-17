import { EntityModel } from "@dataspecer/core-v2";
import { UiState } from "./ui-model";
import { MISSING_MODEL_IDENTIFIER } from "./ui-well-know";

export function sortEntitiesByDisplayLabel(entities: { displayLabel: string }[]): void {
  entities.sort((left, right) => left.displayLabel.localeCompare(right.displayLabel));
}

/**
 * Returns empty UI state with no content.
 */
export function createEmptyUiState(): UiState {
  return {
    models: [],
    classes: [],
    classProfiles: [],
    attributes: [],
    attributeProfiles: [],
    associations: [],
    associationProfiles: [],
    generalizations: [],
  };
}

export function getOwnerModelIdentifier(models: EntityModel[], entity: string | undefined | null): string {
  if (entity === undefined || entity === null) {
    return MISSING_MODEL_IDENTIFIER;
  }
  for (const model of models) {
    if (model.getEntities()[entity] === undefined) {
      continue;
    }
    return model.getId();
  }
  return MISSING_MODEL_IDENTIFIER;
}
