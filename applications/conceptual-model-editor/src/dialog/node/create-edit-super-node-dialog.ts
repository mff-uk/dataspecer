import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { DialogWrapper } from "../dialog-api";
import { EditSuperNodeDialog } from "./edit-super-node-dialog";
import { EditSuperNodeDialogState } from "./edit-super-node-dialog-controller";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isVisualSuperNode, VisualModel, VisualSuperNode } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType } from "../../context/model-context";
import { ClassesContextType } from "../../context/classes-context";
import { entityModelsMapToCmeVocabulary } from "../../dataspecer/semantic-model/semantic-model-adapter";
import { createEntityStateForEdit } from "../utilities/entity-utilities";
import { DiagramSuperNode } from "../../diagram";
import { UseNotificationServiceWriterType } from "../../notification/notification-service-context";
import { LanguageString } from "@dataspecer/core/core/core-resource";

export function createEditSuperNodeDialogState(
  graphContext: ModelGraphContextType,
  visualModel: VisualModel | null,
  language: string,
  superNodeLabel: LanguageString | null,
  superNodeDescription: LanguageString | null,
  referencedModelName: LanguageString | null
): EditSuperNodeDialogState {
  const models = [...graphContext.models.values()];

  const vocabularies = entityModelsMapToCmeVocabulary(graphContext.models, visualModel);

  // EntityState

  const entityState = createEntityStateForEdit(
    language, vocabularies, models?.[0].getId() ?? "", "", superNodeLabel ?? {}, superNodeDescription ?? {});

  return {
    ...entityState,
    referencedModelName: referencedModelName ?? {en: "Visual model"},
  };
}

export const createEditSuperNodeDialog = (
  state: EditSuperNodeDialogState,
  onConfirm: ((state: EditSuperNodeDialogState) => void) | null,
): DialogWrapper<EditSuperNodeDialogState> => {
  return {
    label: "dialog.class.label-edit",
    component: EditSuperNodeDialog,
    state,
    confirmLabel: "dialog.class.ok-edit",
    cancelLabel: "dialog.class.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
