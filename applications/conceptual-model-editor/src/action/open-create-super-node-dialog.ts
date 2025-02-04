import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { EditSuperNodeDialogState } from "../dialog/node/edit-super-node-dialog-controller";
import { createEditSuperNodeDialog, createEditSuperNodeDialogState } from "../dialog/node/create-edit-super-node-dialog";
import { addVisualSuperNodeToVisualModelAction } from "./add-visual-super-node-to-visual-model";
import { UseDiagramType } from "../diagram/diagram-hook";
import { getSelections } from "./utilities";

export function openCreateSuperNodeDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  useGraph: UseModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
) {

  const onConfirm = (nextState: EditSuperNodeDialogState) => {
    const { nodeSelection, edgeSelection } = getSelections(diagram, false, true);
    // TODO RadStr: ... Again calling action from action
    addVisualSuperNodeToVisualModelAction(notifications, useGraph, visualModel,
      nextState.name, nextState.description, nextState.referencedModelName, nodeSelection, edgeSelection);
  };

  const state = createEditSuperNodeDialogState(graph, visualModel, options.language, {}, {}, null);
  dialogs?.openDialog(createEditSuperNodeDialog(state, onConfirm));
}
