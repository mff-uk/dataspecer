import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative } from "../utilities/dialog-utilities";
import { createEntityProfileController, EntityProfileState, EntityProfileStateController } from "../utilities/entity-profile-utilities";
import { createRelationshipProfileController, RelationshipProfileState, RelationshipProfileStateController } from "../utilities/relationship-profile-utilities";


export interface EditAttributeProfileDialogState extends EntityProfileState, RelationshipProfileState<DataTypeRepresentative> { }

export interface EditAttributeProfileDialogController extends EntityProfileStateController, RelationshipProfileStateController<DataTypeRepresentative> { }


export function useEditAttributeProfileDialogController({ changeState }: DialogProps<EditAttributeProfileDialogState>): EditAttributeProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToIri);

    const relationshipProfileController = createRelationshipProfileController(changeState);

    return {
      ...entityProfileController,
      ...relationshipProfileController,
    };
  }, [changeState]);
}
