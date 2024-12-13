import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { createEntityProfileController, EntityProfileState, EntityProfileStateController } from "../utilities/entity-profile-utilities";

export interface EditClassProfileDialogState extends EntityProfileState { }

export interface EditClassProfileDialogController extends EntityProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

}

export function useEditClassProfileDialogController({ changeState }: DialogProps<EditClassProfileDialogState>): EditClassProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToClassIri);

    return {
      ...entityProfileController
    };
  }, [changeState]);
};
