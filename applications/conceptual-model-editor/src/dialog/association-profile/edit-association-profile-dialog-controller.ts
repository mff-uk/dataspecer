import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { EntityRepresentative, RelationshipRepresentative } from "../utilities/dialog-utilities";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";
import { RelationshipProfileState, RelationshipProfileStateController, createRelationshipProfileController } from "../utilities/relationship-profile-utilities";

export interface EditAssociationProfileDialogState extends
  EntityProfileState<RelationshipRepresentative>,
  RelationshipProfileState<EntityRepresentative> { }

export interface EditAssociationProfileDialogController extends
  EntityProfileStateController<RelationshipRepresentative>,
  RelationshipProfileStateController<EntityRepresentative> { }

export function useEditAssociationProfileDialogController({ changeState }:
  DialogProps<EditAssociationProfileDialogState>): EditAssociationProfileDialogController {

  return useMemo(() => {

    const entityProfileController = createEntityProfileController(changeState, configuration().nameToIri);

    const relationshipProfileController = createRelationshipProfileController(changeState);

    return {
      ...entityProfileController,
      ...relationshipProfileController,
    };
  }, [changeState]);
}
