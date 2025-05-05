import { LanguageString } from "../../../dataspecer/entity-model";
import { EditVisualModelDialogState } from "./edit-visual-model-dialog-state";

export function createEditVisualModelDialogState(
  language: string,
  visualModelLabel: LanguageString | null,
): EditVisualModelDialogState {
  return {
    label: visualModelLabel ?? { en: "Visual Model" },
    language,
  };
}
