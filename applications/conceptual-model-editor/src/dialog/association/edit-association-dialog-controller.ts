import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { EntityRepresentative } from "../utilities/dialog-utilities";
import { EntityState, EntityStateController, createEntityController } from "../utilities/entity-utilities";
import { SpecializationState, SpecializationStateController, createSpecializationController } from "../utilities/specialization-utilities";
import { RelationshipController, RelationshipState, createRelationshipController } from "../utilities/relationship-utilities";

export interface EditAssociationDialogState extends
  EntityState, SpecializationState, RelationshipState<EntityRepresentative> { }

export interface EditAssociationDialogController extends
  EntityStateController, SpecializationStateController, RelationshipController<EntityRepresentative> { }

export function useEditAssociationDialogController({ changeState }: DialogProps<EditAssociationDialogState>): EditAssociationDialogController {

  return useMemo(() => {

    const entityController = createEntityController(changeState, configuration().relationshipNameToIri);

    const specializationController = createSpecializationController(changeState);

    const relationshipController = createRelationshipController(changeState);

    return {
      ...entityController,
      ...specializationController,
      ...relationshipController,
    };
  }, [changeState]);
}
