import { CmeGeneralization } from "../../cme-model";
import { UI_GENERALIZATION_TYPE, UiGeneralization } from "../model";
import { UiAdapterContext } from "./adapter-context";

export const cmeGeneralizationToCmeGeneralization = (
  context: UiAdapterContext,
  entity: CmeGeneralization,
): UiGeneralization => {
  return {
    type: UI_GENERALIZATION_TYPE,
    model: entity.model,
    identifier: entity.identifier,
    // We need to compute label later.
    displayLabel: "",
  };
};
