import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";

export type EditClassProfileDialogState = EntityProfileState;

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
