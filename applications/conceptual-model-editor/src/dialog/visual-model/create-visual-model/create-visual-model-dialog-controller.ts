import { useMemo } from "react";

import { type DialogProps } from "../../dialog-api";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";

// There are some extra attrbiutes in the EntityState which we don't need, but that doesn't matter that much
export interface CreateVisualModelDialogState {

  label: LanguageString,

  language: string,

}

export interface CreateVisualModelDialogController {

  setLabel: (setter: (value: LanguageString) => LanguageString) => void;

}

export function useCreateVisualModelDialogController({ changeState }: DialogProps<CreateVisualModelDialogState>): CreateVisualModelDialogController {

  return useMemo(() => {

    const setLabel = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, label: setter(state.label) }));
    };

    return {
      setLabel,
    };
  }, [changeState]);
}
