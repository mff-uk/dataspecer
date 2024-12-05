import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { createCreateEntityController, createEntityController, CreateEntityState, CreateEntityStateController, createSpecializationController, EntityState, EntityStateController, SpecializationState, SpecializationStateController } from "../utilities/entity-utilities";

export interface EditClassDialogState extends EntityState, CreateEntityState, SpecializationState {

  language: string;

}

export interface EditClassDialogController extends EntityStateController, CreateEntityStateController, SpecializationStateController {

}

export function useEditClassDialogController({ changeState }: DialogProps<EditClassDialogState>): EditClassDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState);

    const newEntityController = createCreateEntityController(
      changeState, entityController, configuration().nameToClassIri);

      const specializationController = createSpecializationController(changeState);

    return {
      ...entityController,
      ...newEntityController,
      ...specializationController,
    };
  }, [changeState]);
}
