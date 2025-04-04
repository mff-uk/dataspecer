import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { UseDiagramType } from "../diagram/diagram-hook";
import { addVisualDiagramNodeForNewModelToVisualModelAction as addVisualDiagramNodeForNewModelToVisualModelAction } from "./add-visual-diagram-node-to-visual-model";
import { EditVisualDiagramNodeDialogState } from "@/dialog/visual-model/visual-diagram-node/edit-visual-diagram-node/edit-visual-diagram-node-dialog-controller";
import { createEditVisualDiagramNodeDialogState } from "@/dialog/visual-model/visual-diagram-node/edit-visual-diagram-node/create-edit-visual-diagram-node-dialog";
import { createCreateVisualDiagramNodeDialog } from "@/dialog/visual-model/visual-diagram-node/create-visual-diagram-node/create-create-visual-diagram-node-dialog";

export function openCreateVisualDiagramNodeDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  useGraph: UseModelGraphContextType,
  diagram: UseDiagramType,
  visualModel: WritableVisualModel,
  nodes: string[],
  edges: string[],
) {

  const onConfirm = (nextState: EditVisualDiagramNodeDialogState) => {
    addVisualDiagramNodeForNewModelToVisualModelAction(notifications, graph, useGraph, diagram, visualModel,
      nextState.label, nextState.description, nextState.representedVisualModelName, nodes, edges);
  };

  const state = createEditVisualDiagramNodeDialogState(options.language, {}, {}, null, null);
  dialogs?.openDialog(createCreateVisualDiagramNodeDialog(state, onConfirm));
}
