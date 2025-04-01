import { useMemo } from "react";

import { type DialogProps } from "../../dialog-api";
import { configuration } from "../../../application";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { useActions } from "../../../action/actions-react-binding";
import { BaseEntityDialogController, createBaseEntityDialogController } from "../../base-entity/base-entity-dialog-controller";
import { BaseEntityDialogState } from "../../base-entity/base-entity-dialog-state";

// There are some extra attrbiutes in the EntityState which we don't need, but that doesn't matter that much
export interface EditVisualDiagramNodeDialogState {

  label: LanguageString,

  description: LanguageString,

  representedVisualModelIdentifier: string | null,

  representedVisualModelName: LanguageString,

  language: string,

}

export interface EditVisualDiagramNodeDialogController {

  setLabel: (setter: (value: LanguageString) => LanguageString) => void;

  setDescription: (setter: (value: LanguageString) => LanguageString) => void;

  setRepresentedVisualModelName: (setter: (value: LanguageString) => LanguageString) => void;

  openChangeReferencedVisualModel: () => void;

}

export function useEditVisualDiagramNodeDialogController({ changeState }: DialogProps<EditVisualDiagramNodeDialogState>): EditVisualDiagramNodeDialogController {
  const { openCreateModelDialog } = useActions();

  return useMemo(() => {

    const setLabel = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, label: setter(state.label) }));
    };

    const setDescription = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, description: setter(state.description) }));
    };

    const setRepresentedVisualModelName = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, representedVisualModelName: setter(state.representedVisualModelName) }));
    };

    const openChangeReferencedVisualModel = (): void => {
      openCreateModelDialog();
    };

    return {
      setLabel,
      setDescription,
      setRepresentedVisualModelName,
      openChangeReferencedVisualModel,
    };
  }, [changeState]);
}
