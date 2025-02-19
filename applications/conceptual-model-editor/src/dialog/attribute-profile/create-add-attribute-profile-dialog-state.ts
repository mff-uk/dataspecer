import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { representUndefinedAttribute, listRelationshipProfileDomains, listAttributeProfileRanges, sortRepresentatives } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";
import { listAttributesToProfile } from "./attribute-profile-utilities";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";

/**
 * State represents new profile entity created for given class entity.
 */
export function createAddAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  domainIdentifier: EntityDsIdentifier,
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
    availableProfiles, [], noProfile,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const profile = entityProfileState.profiles[0];
  const relationshipProfileState = createRelationshipProfileStateForNew(
    domainIdentifier,
    profile.domainCardinality.cardinality,
    domains, domains[0],
    profile.range,
    profile.rangeCardinality.cardinality,
    ranges, ranges[0]);

  return {
    ...entityProfileState,
    ...relationshipProfileState,
  };
}

export const createAddAttributeProfileDialog = (
  state: EditAttributeProfileDialogState,
  onConfirm: (state: EditAttributeProfileDialogState) => void,
): DialogWrapper<EditAttributeProfileDialogState> => {
  return {
    label: "dialog.attribute-profile.label-create",
    component: EditAttributeProfileDialog,
    state,
    confirmLabel: "dialog.attribute-profile.ok-create",
    cancelLabel: "dialog.attribute-profile.cancel",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
