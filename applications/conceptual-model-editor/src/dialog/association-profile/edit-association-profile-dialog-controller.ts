import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { EntityRepresentative } from "../utilities/dialog-utilities";
import { createEntityProfileController, EntityProfileState, EntityProfileStateController } from "../utilities/entity-profile-utilities";
import { createRelationshipProfileController, RelationshipProfileState, RelationshipProfileStateController } from "../utilities/relationship-profile-utilities";

export interface EditAssociationProfileDialogState extends EntityProfileState, RelationshipProfileState<EntityRepresentative> { }

export interface EditAssociationProfileDialogController extends EntityProfileStateController, RelationshipProfileStateController<EntityRepresentative> { }

export function useEditAssociationProfileDialogController({ changeState }: DialogProps<EditAssociationProfileDialogState>): EditAssociationProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToIri);

    const relationshipProfileController = createRelationshipProfileController(changeState);

    return {
      ...entityProfileController,
      ...relationshipProfileController,
    };
  }, [changeState]);
}
