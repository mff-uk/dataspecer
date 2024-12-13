import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { EntityRepresentative } from "../utilities/dialog-utilities";
import { createEntityController, EntityState, EntityStateController } from "../utilities/entity-utilities";
import { createSpecializationController, SpecializationState, SpecializationStateController } from "../utilities/specialization-utilities";
import { createRelationshipController, RelationshipController, RelationshipState } from "../utilities/relationship-utilities";

export interface EditAssociationDialogState extends
  EntityState, SpecializationState, RelationshipState<EntityRepresentative> { }

export interface EditAssociationDialogController extends
  EntityStateController, SpecializationStateController, RelationshipController<EntityRepresentative> { }

export function useEditAssociationDialogController({ changeState }: DialogProps<EditAssociationDialogState>): EditAssociationDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState, configuration().nameToIri);

    const specializationController = createSpecializationController(changeState);

    const relationshipController = createRelationshipController(changeState);

    return {
      ...entityController,
      ...specializationController,
      ...relationshipController,
    };
  }, [changeState]);
}