import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassDialogState } from "./edit-class-dialog-controller";
import { representClasses, sortRepresentatives } from "../utilities/dialog-utilities";
import { createEntityStateForEdit } from "../utilities/entity-utilities";
import { createSpecializationStateForEdit } from "../utilities/specialization-utilities";
import { EditClassDialog } from "./edit-class-dialog";
import { DialogWrapper } from "../dialog-api";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { isValid } from "../utilities/validation-utilities";

export function createEditClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  model: InMemorySemanticModel,
  entity: SemanticModelClass,
): EditClassDialogState {
  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState

  const entityState = createEntityStateForEdit(
    language, vocabularies, model.getId(), entity.iri ?? "", entity.name, entity.description);

  // SpecializationState

  const specializations = representClasses(
    models, entityState.allModels, classesContext.classes);
  sortRepresentatives(language, specializations);

  const specializationState = createSpecializationStateForEdit(
    language, classesContext, entityState.allModels, specializations, entity.id,
  );

  return {
    ...entityState,
    ...specializationState,
  };
}

export const createEditClassDialog = (
  state: EditClassDialogState,
  onConfirm: (state: EditClassDialogState) => void | null,
): DialogWrapper<EditClassDialogState> => {
  return {
    label: "dialog.class.label-edit",
    component: EditClassDialog,
    state,
    confirmLabel: "dialog.class.ok-edit",
    cancelLabel: "dialog.class.cancel",
    validate: (state) => isValid(state.iriValidation),
    onConfirm,
    onClose: null,
  };
};
