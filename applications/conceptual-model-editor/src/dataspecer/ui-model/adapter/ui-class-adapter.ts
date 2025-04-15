import { UI_CLASS_TYPE, UiClass } from "../model";
import { UiAdapterContext } from "./adapter-context";
import { CmeClass } from "../../cme-model";

export const cmeClassToUiClass = (
  context: UiAdapterContext,
  entity: CmeClass,
): UiClass => {
  return {
    type: UI_CLASS_TYPE,
    model: entity.model,
    identifier: entity.identifier,
    iri: entity.iri ?? "",
    displayLabel: context.selectDisplayLabel(entity),
    displayDescription: context.selectLanguageString(entity.description),
  };
};
