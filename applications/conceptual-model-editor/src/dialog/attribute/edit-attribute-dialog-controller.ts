import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative } from "../utilities/dialog-utilities";
import { EntityState, EntityStateController, createEntityController } from "../utilities/entity-utilities";
import { SpecializationState, SpecializationStateController, createSpecializationController } from "../utilities/specialization-utilities";
import { RelationshipController, RelationshipState, createRelationshipController } from "../utilities/relationship-utilities";

export interface EditAttributeDialogState extends
  EntityState, SpecializationState, RelationshipState<DataTypeRepresentative> { }

export interface EditAttributeDialogController extends
  EntityStateController, SpecializationStateController, RelationshipController<DataTypeRepresentative> { }

export function useEditAttributeDialogController({ changeState }: DialogProps<EditAttributeDialogState>): EditAttributeDialogController {

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
