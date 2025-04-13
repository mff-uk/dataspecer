import { DialogWrapper } from "@/dialog/dialog-api";
import { CreateVisualModelDialogState } from "./create-visual-model-dialog-controller";
import { CreateVisualModelDialog } from "./create-visual-model-dialog";
import { LanguageString } from "@/dataspecer/entity-model";

export function createCreateVisualModelDialogState(
  language: string,
  visualModelLabel: LanguageString | null,
): CreateVisualModelDialogState {

  return {
    label: visualModelLabel ?? {en: "Visual Model"},
    language,
  };
}

export const createCreateVisualModelDialog = (
  state: CreateVisualModelDialogState,
  onConfirm: ((state: CreateVisualModelDialogState) => void) | null,
): DialogWrapper<CreateVisualModelDialogState> => {
  return {
    label: "dialog.visual-model.label-create",
    component: CreateVisualModelDialog,
    state,
    confirmLabel: "dialog.visual-model.ok-create",
    cancelLabel: "dialog.visual-model.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};