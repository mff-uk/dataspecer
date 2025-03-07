import { useMemo } from "react";

import { configuration } from "../../application";
import { DialogProps } from "../dialog-api";
import { DataTypeRepresentative, EntityRepresentative, RelationshipRepresentative } from "../utilities/dialog-utilities";
import { EntityProfileState, EntityProfileStateController, createEntityProfileController } from "../utilities/entity-profile-utilities";
import { RelationshipProfileState, RelationshipProfileStateController, createRelationshipProfileController, filterByModel } from "../utilities/relationship-profile-utilities";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { validateEntityState } from "../utilities/entity-utilities";
import { CmeModel } from "../../dataspecer/cme-model";

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

    const entityProfileController = createEntityProfileController(
      changeState, configuration().relationshipNameToIri);

    const relationshipProfileController = createRelationshipProfileController(
      changeState, filterByModel, items => items);

    const setModel = (model: CmeModel) => {
      entityProfileController.setModel(model);
      relationshipProfileController.onModelDidChange(model);
      changeState(state => configuration().relationshipProfileToIri(state));
    };

    const setName = (setter: (value: LanguageString) => LanguageString): void => {
      changeState(state => {
        const result = { ...state, name : setter(state.name) };
        return configuration().relationshipProfileToIri(result);
      });
    };

    const setDomain = (value: EntityRepresentative): void => {
      relationshipProfileController.setDomain(value);
      changeState(state => configuration().relationshipProfileToIri(state));
    };

    const setIri = (iri: string) => {
      changeState((state) => validateEntityState({ ...state, iri, isIriAutogenerated: false }));
    };

    return {
      ...entityProfileController,
      ...relationshipProfileController,
      setModel,
      setName,
      setDomain,
      setIri,
    };
  }, [changeState]);
}
