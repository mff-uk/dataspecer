import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative, RelationshipRepresentative } from "../utilities/dialog-utilities";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";
import { RelationshipProfileState, RelationshipProfileStateController, createRelationshipProfileController } from "../utilities/relationship-profile-utilities";

export interface EditAttributeProfileDialogState extends
  EntityProfileState<RelationshipRepresentative>,
  RelationshipProfileState<DataTypeRepresentative> {

}

export interface EditAttributeProfileDialogController extends
  EntityProfileStateController<RelationshipRepresentative>,
  RelationshipProfileStateController<DataTypeRepresentative> {

}

export function useEditAttributeProfileDialogController({ changeState }:
  DialogProps<EditAttributeProfileDialogState>
): EditAttributeProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToIri);

    const relationshipProfileController = createRelationshipProfileController(changeState);

    return {
      ...entityProfileController,
      ...relationshipProfileController,
      removeProfileOf: (value: RelationshipRepresentative) => {
        entityProfileController.removeProfileOf(value);
        relationshipProfileController.onRemoveProfileOf(value);
      },
    };
  }, [changeState]);
}
