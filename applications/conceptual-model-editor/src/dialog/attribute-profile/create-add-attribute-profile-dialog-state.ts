
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeProfileDialogState } from "./edit-attribute-profile-dialog-controller";
import { EditAttributeProfileDialog } from "./edit-attribute-profile-dialog";
import { DialogWrapper } from "../dialog-api";
import { RuntimeError } from "../../application/error";
import { createRelationshipProfileStateForNew } from "../utilities/relationship-profile-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { listDataTypes, representUndefinedDataType, selectDefaultModelForAttribute, listClassProfiles } from "../utilities/dialog-utilities";
import { createEntityProfileStateForNewEntityProfile } from "../utilities/entity-profile-utilities";
import { configuration } from "../../application";
import { listAttributesToProfile } from "./attribute-profile-utilities";

/**
 * State represents new profile entity created for given class entity.
 */
export function createAddAttributeProfileDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  domainEntity: SemanticModelClassUsage,
): EditAttributeProfileDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  const availableProfiles = listAttributesToProfile(
    classesContext, graphContext, vocabularies);
  if (availableProfiles.length === 0) {
    throw new RuntimeError("There is no attribute to profile.");
  }

  // We just profile the first available attribute.
  const profileOf = availableProfiles[0];
  if (profileOf === null) {
    throw new RuntimeError("There is nothing to profile.");
  }

  const classProfiles = listClassProfiles(classesContext, graphContext, vocabularies);

  // EntityProfileState

  const entityProfileState = createEntityProfileStateForNewEntityProfile(
    language, vocabularies, availableProfiles, profileOf.identifier,
    configuration().nameToIri);

  // RelationshipState<EntityRepresentative>

  const defaultRange = representUndefinedDataType();

  const relationshipProfileState = createRelationshipProfileStateForNew(
    profileOf,
    domainEntity.id, profileOf.domainCardinality.cardinality, classProfiles,
    profileOf.range, defaultRange, profileOf.rangeCardinality.cardinality,
    listDataTypes());

  return {
    ...entityProfileState,
    ...relationshipProfileState,
    model: selectDefaultModelForAttribute(
      domainEntity.id, models, entityProfileState.availableModels),
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
