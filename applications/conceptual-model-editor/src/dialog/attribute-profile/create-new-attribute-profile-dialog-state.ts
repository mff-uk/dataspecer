import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { createRelationshipProfileState, filterByModel } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { representUndefinedAttribute, listRelationshipProfileDomains, listAttributeProfileRanges, sortRepresentatives, representUndefinedClassProfile, representUndefinedDataType } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";
import { listAttributesToProfile } from "./attribute-profile-utilities";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { isValid } from "../utilities/validation-utilities";

/**
 * State represents a newly created profile for given profiled entity.
 */
export function createNewAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  profilesIdentifiers: EntityDsIdentifier[],
): EditAttributeProfileDialogState {

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const noProfile = representUndefinedAttribute();

  const availableProfiles = listAttributesToProfile(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, availableProfiles);

  const domains = listRelationshipProfileDomains(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, domains);

  const ranges = listAttributeProfileRanges();

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, configuration().languagePreferences,
    vocabularies,
    availableProfiles, profilesIdentifiers, noProfile,
    configuration().relationshipNameToIri);

  // RelationshipState<EntityRepresentative>

  const profile = entityProfileState.profiles[0];

  // As we use the first model to get domain and range,
  // we use it to select default model.
  entityProfileState.model =
  entityProfileState.availableModels.find(
    model => model.dsIdentifier === profile.vocabularyDsIdentifier)
  ?? entityProfileState.model;

  const relationshipProfileState = createRelationshipProfileState(
    entityProfileState.model,
    vocabularies,
    profile.domain, profile.domainCardinality.cardinality, domains,
    filterByModel, representUndefinedClassProfile(),
    profile.range, profile.rangeCardinality.cardinality, ranges,
    items => items, representUndefinedDataType());

  const result = {
    ...entityProfileState,
    ...relationshipProfileState,
    isIriAutogenerated: true,
  };
  return configuration().relationshipProfileToIri(result);
}

export const createEditAttributeProfileDialog = (
  state: EditAttributeProfileDialogState,
  onConfirm: (state: EditAttributeProfileDialogState) => void,
): DialogWrapper<EditAttributeProfileDialogState> => {
  return {
    label: "dialog.attribute-profile.label-create",
    component: EditAttributeProfileDialog,
    state,
    confirmLabel: "dialog.attribute-profile.ok-create",
    cancelLabel: "dialog.attribute-profile.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}
