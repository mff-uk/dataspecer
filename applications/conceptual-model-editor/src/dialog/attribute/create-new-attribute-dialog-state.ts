import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeDialogState } from "./edit-attribute-dialog-controller";
import { isRepresentingAttribute, listAttributeRanges, representOwlThing, representRelationships, representRdfsLiteral, listRelationshipDomains, sortRepresentatives, representUndefinedClass, representUndefinedDataType } from "../utilities/dialog-utilities";
import { configuration } from "../../application";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipStateForNew } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { isValid } from "../utilities/validation-utilities";

export function createNewAttributeDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  defaultModelIdentifier: string | null,
): EditAttributeDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(
    graphContext.models, visualModel);

  const owlThing = representOwlThing();

  const rdfsLiteral = representRdfsLiteral();

  // EntityState

  const entityState = createEntityStateForNew(
    language, defaultModelIdentifier, vocabularies, configuration().relationshipNameToIri);

  // SpecializationState

  const specializations = representRelationships(
    models, entityState.allModels, classesContext.relationships,
    owlThing.identifier, rdfsLiteral.identifier)
    .filter(item => isRepresentingAttribute(item));
  sortRepresentatives(language, specializations);

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels, specializations);

  // RelationshipState

  const domains = listRelationshipDomains(
    classesContext, graphContext, vocabularies);
  sortRepresentatives(language, domains);

  const dataTypes = listAttributeRanges();

  const relationshipState = createRelationshipStateForNew(
    vocabularies, owlThing, representUndefinedClass(),
    domains, rdfsLiteral, representUndefinedDataType(),
    dataTypes);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
  };
}

export const createNewAttributeDialog = (
  state: EditAttributeDialogState,
  onConfirm: (state: EditAttributeDialogState) => void,
): DialogWrapper<EditAttributeDialogState> => {
  return {
    label: "dialog.attribute.label-create",
    component: EditAttributeDialog,
    state,
    confirmLabel: "dialog.attribute.ok-create",
    cancelLabel: "dialog.attribute.cancel",
    validate: (state) => isValid(state.iriValidation)
      && isValid(state.domainValidation)
      && isValid(state.rangeValidation),
    onConfirm: onConfirm,
    onClose: null,
  };
}
