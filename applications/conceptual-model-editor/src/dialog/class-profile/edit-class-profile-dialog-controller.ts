import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, EntityState, EntityStateController } from "../utilities/entity-utilities";
import { createProfileController, ProfileState, ProfileStateController } from "../utilities/profile-utilities";

export interface EditClassProfileDialogState extends EntityState, CreateEntityState, ProfileState {

  language: string;

  overrideName: boolean;

  overrideDescription: boolean;

}

export interface EditClassProfileDialogController extends EntityStateController, CreateEntityStateController, ProfileStateController {

  toggleNameOverride: () => void;

  toggleDescriptionOverride: () => void;

}

export function useEditClassProfileDialogController({ changeState }: DialogProps<EditClassProfileDialogState>): EditClassProfileDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToClassIri);

    const profileController = createProfileController(changeState);

    const toggleNameOverride = () => {
      changeState((state) => ({ ...state, overrideName: !state.overrideName }));
    };

    const toggleDescriptionOverride = () => {
      changeState((state) => ({ ...state, overrideDescription: !state.overrideDescription }));
    };


    return {
      ...entityController,
      ...profileController,
      ...newEntityController,
      toggleNameOverride,
      toggleDescriptionOverride,
    };
  }, [changeState]);
};
