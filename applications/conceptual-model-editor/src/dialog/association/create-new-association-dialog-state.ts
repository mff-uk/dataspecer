import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { configuration } from "../../application";
import { EditAssociationDialogState } from "./edit-association-dialog-controller";
import { EditAssociationDialog } from "./edit-association-dialog";
import { DialogWrapper } from "../dialog-api";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { isRepresentingAssociation, listRelationshipDomains, representOwlThing, representRelationships, representUndefinedClass, sortRepresentatives } from "../utilities/dialog-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipState } from "../utilities/relationship-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { isValid } from "../utilities/validation-utilities";

export function createCreateAssociationDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  defaultModelIdentifier: string | null,
): EditAssociationDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const owlThing = representOwlThing();

  // EntityState

  const entityState = createEntityStateForNew(
    language, defaultModelIdentifier, vocabularies, configuration().relationshipNameToIri);

  // SpecializationState

  const specializations = representRelationships(
    models, entityState.allModels, classesContext.relationships,
    owlThing.identifier, owlThing.identifier)
    .filter(item => isRepresentingAssociation(item));
  sortRepresentatives(language, specializations);

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels, specializations);

  // RelationshipState

  const domains = listRelationshipDomains(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, domains);

  // For association domains are same as ranges.
  const ranges = domains;

  const relationshipState = createRelationshipState(
    vocabularies,
    owlThing.identifier, representUndefinedClass(), null, domains,
    owlThing.identifier, representUndefinedClass(), null, ranges);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
  };
}

export const createNewAssociationDialog = (
  state: EditAssociationDialogState,
  onConfirm: (state: EditAssociationDialogState) => void,
): DialogWrapper<EditAssociationDialogState> => {
  return {
    label: "dialog.association.label-create",
    component: EditAssociationDialog,
    state,
    confirmLabel: "dialog.association.ok-create",
    cancelLabel: "dialog.association.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}
