import { type DialogProps } from "../../dialog-api";
import { LanguageString } from "../../../dataspecer/entity-model";
import { EditVisualModelDialogState } from "./edit-visual-model-dialog-state";

type SetLanguageString = (value: LanguageString) => LanguageString;

export interface EditVisualModelDialogController {

  setLabel: (setter: (value: LanguageString) => LanguageString) => void;

}

export function useEditVisualModelDialogController(
  { changeState }: DialogProps<EditVisualModelDialogState>,
): EditVisualModelDialogController {

  const setLabel = (setter: SetLanguageString): void => {
    changeState((state) => ({ ...state, label: setter(state.label) }));
  };

  return {
    setLabel,
  };
}
