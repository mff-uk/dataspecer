import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { configuration } from "../../application";
import { EditAssociationDialogState } from "./edit-association-dialog-controller";
import { EditAssociationDialog } from "./edit-association-dialog";
import { DialogWrapper } from "../dialog-api";
import { createEntityStateForNew, isEntityStateValid } from "../utilities/entity-utilities";
import { isRepresentingAttribute, representClasses, representOwlThing, representRelationships } from "../utilities/dialog-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipStateForNew } from "../utilities/relationship-utilities";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";

export function createCreateAssociationDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  defaultModelIdentifier: string | null,
): EditAssociationDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState

  const entityState = createEntityStateForNew(
    language, defaultModelIdentifier, vocabularies, configuration().nameToIri);

  // SpecializationState

  const specializations =
    representRelationships(models, entityState.allModels, classesContext.relationships)
      .filter(item => isRepresentingAttribute(item));

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels, specializations);

  // RelationshipState

  const owlThing = representOwlThing();
  const classes = [owlThing, ...representClasses(models, entityState.allModels, classesContext.classes)];

  const relationshipState = createRelationshipStateForNew(
    owlThing, classes, owlThing, classes);

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
    validate: isEntityStateValid,
    onConfirm: onConfirm,
    onClose: null,
  };
}
