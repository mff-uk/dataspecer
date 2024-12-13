import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditAttributeDialogState } from "./edit-attribute-dialog-controller";
import { isRepresentingAttribute, representClasses, representDataTypes, representOwlThing, representRelationships, representUndefinedDataType } from "../utilities/dialog-utilities";
import { configuration } from "../../application";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { createRelationshipStateForNew } from "../utilities/relationship-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";

export function createNewAttributeDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
): EditAttributeDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState

  const entityState = createEntityStateForNew(language, vocabularies, configuration().nameToIri);

  // SpecializationState

  const specializations =
    representRelationships(models, entityState.allModels, classesContext.relationships)
      .filter(item => isRepresentingAttribute(item));

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels, specializations);

  // RelationshipState

  const owlThing = representOwlThing();
  const classes = [owlThing, ...representClasses(models, entityState.allModels, classesContext.classes)];

  const undefinedDataType = representUndefinedDataType();
  const dataTypes = [undefinedDataType, ...representDataTypes(),];

  const relationshipState = createRelationshipStateForNew(
    owlThing, classes, undefinedDataType, dataTypes);

  return {
    ...entityState,
    ...specializationState,
    ...relationshipState,
  };
}

export const createEditAttributeDialog = (
  state: EditAttributeDialogState,
  onConfirm: (state: EditAttributeDialogState) => void,
): DialogWrapper<EditAttributeDialogState> => {
  return {
    label: "create-attribute-dialog.label",
    component: EditAttributeDialog,
    state,
    confirmLabel: "modify-dialog.btn-ok",
    cancelLabel: "modify-dialog.btn-close",
    validate: () => true,
    onConfirm: onConfirm,
    onClose: null,
  };
}
