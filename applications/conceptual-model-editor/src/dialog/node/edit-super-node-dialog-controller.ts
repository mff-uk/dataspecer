import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { EntityState, EntityStateController, createEntityController } from "../utilities/entity-utilities";
import { SpecializationState, SpecializationStateController, createSpecializationController } from "../utilities/specialization-utilities";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { useActions } from "../../action/actions-react-binding";

// There are some extra attrbiutes in the EntityState which we don't need, but that doesn't matter that much
export interface EditSuperNodeDialogState extends EntityState {

  referencedModelName: LanguageString;

}

export interface EditSuperNodeDialogController extends Omit<EntityStateController, "setModel"> {

  setReferencedModelName: (setter: (value: LanguageString) => LanguageString) => void;

  openChangeReferencedVisualModel: () => void;

}

export function useEditSuperNodeDialogController({ changeState }: DialogProps<EditSuperNodeDialogState>): EditSuperNodeDialogController {
  const { openCreateModelDialog } = useActions();

  return useMemo(() => {

    const entity = createEntityController(changeState, configuration().nameToClassIri);

    const setReferencedModelName = (setter: (value: LanguageString) => LanguageString): void => {
      changeState((state) => ({ ...state, referencedModelName: setter(state.referencedModelName) }));
    };

    const openChangeReferencedVisualModel = (): void => {
      openCreateModelDialog();
    };

    return {
      ...entity,
      setReferencedModelName,
      openChangeReferencedVisualModel,
    };
  }, [changeState]);
}
