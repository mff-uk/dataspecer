import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";
import { EntityRepresentative } from "../utilities/dialog-utilities";

export type EditClassProfileDialogState =
  EntityProfileState<EntityRepresentative>;

export type EditClassProfileDialogController =
  EntityProfileStateController<EntityRepresentative>;

export function useEditClassProfileDialogController({ changeState }:
  DialogProps<EditClassProfileDialogState>
): EditClassProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(
      changeState, configuration().classNameToIri);

    return {
      ...entityProfileController
    };
  }, [changeState]);
};
