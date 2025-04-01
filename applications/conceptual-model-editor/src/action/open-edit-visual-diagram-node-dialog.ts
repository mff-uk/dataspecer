import { Options } from "../application";
import { ModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { isVisualDiagramNode, VisualDiagramNode, VisualModel, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { VisualModelDiagramNode } from "../diagram";
import { EditVisualDiagramNodeDialogState } from "@/dialog/visual-diagram-node/edit-visual-diagram-node/edit-visual-diagram-node-dialog-controller";
import { createEditVisualDiagramNodeDialog, createEditVisualDiagramNodeDialogState } from "@/dialog/visual-diagram-node/edit-visual-diagram-node/create-edit-visual-diagram-node-dialog";

export function openEditVisualDiagramNodeDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  visualModelDiagramNode: VisualModelDiagramNode,
) {

  const dialogData = prepareDataForVisualDiagramNodeDialog(
    notifications, options, graph, visualModel, visualModelDiagramNode);
  if (dialogData === null) {
    return;
  }

  const onConfirm = (nextState: EditVisualDiagramNodeDialogState) => {
    dialogData.referencedVisualModel.setLabel(nextState.representedVisualModelName);
    updateVisualDiagramNode(visualModel, dialogData.visualDiagramNode, nextState);

    // TODO RadStr: Hack to force update in the Header component
    const activeViewId = graph.aggregatorView.getActiveViewId();
    graph.aggregatorView.changeActiveVisualModel(activeViewId ?? null);
    graph.setAggregatorView(graph.aggregator.getView());
  };

  dialogs?.openDialog(createEditVisualDiagramNodeDialog(dialogData.state, onConfirm));

}

export function prepareDataForVisualDiagramNodeDialog(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  graph: ModelGraphContextType,
  visualModel: VisualModel,
  visualModelDiagramNode: VisualModelDiagramNode,
): {
  visualDiagramNode: VisualDiagramNode,
  referencedVisualModel: VisualModel,
  state: EditVisualDiagramNodeDialogState,
} | null {
  const visualDiagramNode = visualModel?.getVisualEntity(visualModelDiagramNode.identifier) ?? null;
  if(visualDiagramNode === null || !isVisualDiagramNode(visualDiagramNode)) {
    notifications.error("Some really bad error - editing not existing visual diagram node");
    return null;
  }

  const referencedVisualModel = graph.aggregatorView.getAvailableVisualModels().find(
    availableModel => availableModel.getIdentifier() === visualDiagramNode.representedVisualModel);

  if(referencedVisualModel === undefined) {
    notifications.error("The edited visual diagram node has missing the referenced visual model");
    return null;
  }

  const state = createEditVisualDiagramNodeDialogState(
    options.language, visualDiagramNode.label, visualDiagramNode.description,
    referencedVisualModel.getLabel(), visualDiagramNode.representedVisualModel);

  return { visualDiagramNode, referencedVisualModel, state };
}

function updateVisualDiagramNode(
  visualModel: WritableVisualModel,
  visualDiagramNode: VisualDiagramNode,
  nextState: EditVisualDiagramNodeDialogState,
) {
  visualModel.updateVisualEntity(visualDiagramNode.identifier, {
    ...visualDiagramNode,
    label: nextState.label,
    description: nextState.description,
  });
}