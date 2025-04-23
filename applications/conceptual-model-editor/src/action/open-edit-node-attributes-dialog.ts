import {  WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DialogApiContextType } from "../dialog/dialog-service";
import { ClassesContextType } from "../context/classes-context";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createEditVisualNodeDialog } from "../dialog/visual-node/edit-visual-node-dialog";
import { Options } from "../application";
import { createEditVisualNodeState, EditVisualNodeDialogState } from "../dialog/visual-node/edit-visual-node-dialog-state";
import { ModelGraphContextType } from "../context/model-context";

export function openEditNodeAttributesDialogAction(
  _classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  dialogs: DialogApiContextType,
  _notifications: UseNotificationServiceWriterType,
  options: Options,
  visualModel: WritableVisualModel,
  visualNodeIdentifier: string,
) {
  const initialState = createEditVisualNodeState(
    graphContext, visualModel, visualNodeIdentifier,
    options.language);

  const onConfirm = (state: EditVisualNodeDialogState) => {
    visualModel.updateVisualEntity(visualNodeIdentifier, {
      content: state.activeContent.map(item => item.identifier)
    });
  };

  dialogs.openDialog(createEditVisualNodeDialog(initialState, onConfirm));
}
