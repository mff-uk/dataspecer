import { useMemo } from "react";

import { type DialogProps } from "../dialog-api";
import { configuration } from "../../application";
import { sortRepresentatives, type EntityRepresentative } from "../utilities/dialog-utilities";
import {
  type BaseEntityProfileDialogController,
  createBaseEntityProfileDialogController,
} from "../base-entity-profile/base-entity-profile-dialog-controller";
import { ClassProfileDialogState } from "./edit-class-profile-dialog-state";
import { CmeSemanticModel } from "../../dataspecer/cme-model";
import { sanitizeDuplicitiesInRepresentativeLabels } from "../../utilities/label";

export interface ClassProfileDialogController extends
  BaseEntityProfileDialogController<EntityRepresentative> { }

export function useClassProfileDialogController(
  { changeState }: DialogProps<ClassProfileDialogState>,
): ClassProfileDialogController {
  return useMemo(() => {

    const profileController = createBaseEntityProfileDialogController(
      changeState, configuration().classNameToIri);

    const setModel = (model: CmeSemanticModel) => {
      profileController.setModel(model);
      changeState((state) => {
        const result = {
          ...state,
        };

        // Update available specializations
        const availableSpecializations = sanitizeDuplicitiesInRepresentativeLabels(
          state.allModels,
          state.allSpecializations.filter(item => item.vocabularyDsIdentifier === model.dsIdentifier));
        sortRepresentatives(state.language, availableSpecializations);
        state.availableSpecializations = availableSpecializations;

        // Remove specializations from other model.
        result.specializations = result.specializations
          .filter(item => item.specializationOf.model === model.dsIdentifier);

        return result;
      });
    };

    return {
      ...profileController,
      setModel,
    };
  }, [changeState]);
};
