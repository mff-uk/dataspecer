import { DialogWrapper } from "../../dialog-api";
import { EditVisualDiagramNodeDialog as EditVisualDiagramNodeDialog } from "./edit-visual-diagram-node-dialog";
import { EditVisualDiagramNodeDialogState } from "./edit-visual-diagram-node-dialog-controller";
import { LanguageString } from "@dataspecer/core/core/core-resource";

export function createEditVisualDiagramNodeDialogState(
  language: string,
  visualDiagramNodeLabel: LanguageString | null,
  visualDiagramNodeDescription: LanguageString | null,
  representedVisualModelName: LanguageString | null,
  representedVisualModelIdentifier: string | null,
): EditVisualDiagramNodeDialogState {

  return {
    label: visualDiagramNodeLabel ?? {},
    description: visualDiagramNodeDescription ?? {},
    representedVisualModelIdentifier,
    representedVisualModelName: representedVisualModelName ?? {en: "Visual model"},
    language,
  };
}

export const createEditVisualDiagramNodeDialog = (
  state: EditVisualDiagramNodeDialogState,
  onConfirm: ((state: EditVisualDiagramNodeDialogState) => void) | null,
): DialogWrapper<EditVisualDiagramNodeDialogState> => {
  return {
    label: "dialog.visual-diagram-node.label-edit",
    component: EditVisualDiagramNodeDialog,
    state,
    confirmLabel: "dialog.visual-diagram-node.ok-edit",
    cancelLabel: "dialog.visual-diagram-node.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
