import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { getSelections } from "./utilities";
import { EditVisualDiagramNodeDialogState } from "@/dialog/visual-diagram-node/edit-visual-diagram-node/edit-visual-diagram-node-dialog-controller";
import { addVisualDiagramNodeToVisualModelAction as addVisualDiagramNodeToVisualModelAction } from "./add-visual-diagram-node-to-visual-model";
import { createEditVisualDiagramNodeDialogState } from "@/dialog/visual-diagram-node/edit-visual-diagram-node/create-edit-visual-diagram-node-dialog";
import { createCreateVisualDiagramNodeDialog } from "@/dialog/visual-diagram-node/create-visual-diagram-node/create-create-visual-diagram-node-dialog";

export function openCreateVisualDiagramNodeDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  useGraph: UseModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
) {

  const onConfirm = (nextState: EditVisualDiagramNodeDialogState) => {
    const { nodeSelection, edgeSelection } = getSelections(diagram, false, true);
    addVisualDiagramNodeToVisualModelAction(notifications, graph, useGraph, diagram, visualModel,
      nextState.label, nextState.description, nextState.representedVisualModelName, nodeSelection, edgeSelection);
  };

  const state = createEditVisualDiagramNodeDialogState(options.language, {}, {}, null, null);
  dialogs?.openDialog(createCreateVisualDiagramNodeDialog(state, onConfirm));
}
