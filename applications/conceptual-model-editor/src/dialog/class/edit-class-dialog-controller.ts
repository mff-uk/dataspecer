import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { EntityState, EntityStateController, createEntityController } from "../utilities/entity-utilities";
import { SpecializationState, SpecializationStateController, createSpecializationController } from "../utilities/specialization-utilities";

export interface EditClassDialogState extends EntityState, SpecializationState { }

export interface EditClassDialogController extends EntityStateController, SpecializationStateController { }

export function useEditClassDialogController({ changeState }: DialogProps<EditClassDialogState>): EditClassDialogController {

  return useMemo(() => {

    const entity = createEntityController(changeState, configuration().nameToClassIri);

    const specialization = createSpecializationController(changeState);

    return {
      ...entity,
      ...specialization,
    };
  }, [changeState]);
}
