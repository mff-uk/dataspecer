import { useMemo } from "react";

import {
  BaseEntityDialogController,
  createBaseEntityDialogController,
} from "../base-entity/base-entity-dialog-controller";
import {
  BaseRelationshipDialogController,
  createBaseRelationshipDialogController,
} from "../base-relationship/base-relationship-dialog-controller";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative } from "../utilities/dialog-utilities";
import { AttributeDialogState } from "./edit-attribute-dialog-state";
import { configuration } from "../../application";

export interface EditAttributeDialogController extends
  BaseEntityDialogController,
  BaseRelationshipDialogController<DataTypeRepresentative> { }

export function useAttributeDialogController(
  { changeState }: DialogProps<AttributeDialogState>,
): EditAttributeDialogController {

  return useMemo(() => {

    const entityController = createBaseEntityDialogController(
      changeState, configuration().relationshipNameToIri);

    const relationshipController = createBaseRelationshipDialogController(
      changeState);

    return {
      ...entityController,
      ...relationshipController,
    };
  }, [changeState]);
}
