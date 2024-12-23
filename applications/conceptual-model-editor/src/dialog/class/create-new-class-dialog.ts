import { VisualModel } from "@dataspecer/core-v2/visual-model";

import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { EditClassDialogState } from "./edit-class-dialog-controller";
import { representClasses } from "../utilities/dialog-utilities";
import { configuration } from "../../application";
import { createEntityStateForNew } from "../utilities/entity-utilities";
import { createSpecializationStateForNew } from "../utilities/specialization-utilities";
import { DialogWrapper } from "../dialog-api";
import { EditClassDialog } from "./edit-class-dialog";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";

export function createNewClassDialogState(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
): EditClassDialogState {

  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState

  const entityState = createEntityStateForNew(language, vocabularies, configuration().nameToIri);

  // SpecializationState

  const specializationState = createSpecializationStateForNew(
    language, entityState.allModels,
    representClasses(models, entityState.allModels, classesContext.classes));

  return {
    ...entityState,
    ...specializationState,
  };
}

/**
 *
 * @param state
 * @param onConfirm
 * @returns
 */
export const createNewClassDialog = (
  state: EditClassDialogState,
  onConfirm: (state: EditClassDialogState) => void | null,
): DialogWrapper<EditClassDialogState> => {
  return {
    label: "create-class-dialog.label",
    component: EditClassDialog,
    state,
    confirmLabel: "create-class-dialog.btn-ok",
    cancelLabel: "create-class-dialog.btn-cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
