import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { Options } from "../application";
import { ClassesContextType } from "../context/classes-context";
import { ModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { isVisualSuperNode, VisualModel, VisualSuperNode, WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { DiagramSuperNode } from "../diagram";
import { EditSuperNodeDialogState } from "../dialog/node/edit-super-node-dialog-controller";
import { createEditSuperNodeDialog, createEditSuperNodeDialogState } from "../dialog/node/create-edit-super-node-dialog";

export function openEditSuperNodeDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  superDiagramNode: DiagramSuperNode,
) {

  const superNode = visualModel?.getVisualEntity(superDiagramNode.identifier) ?? null;
  if(superNode === null || !isVisualSuperNode(superNode)) {
    notifications.error("Some really bad error - editing not existing super node");
    return;
  }

  const onConfirm = (nextState: EditSuperNodeDialogState) => {
    updateSuperNode(visualModel, superNode, nextState);
  };

  const referencedModel = graph.aggregatorView.getAvailableVisualModels().find(availableModel => availableModel.getIdentifier() === superNode.visualModels[0]);
  const state = createEditSuperNodeDialogState(graph, visualModel, options.language, superNode.label, superNode.description, referencedModel?.getLabel() ?? null);
  dialogs?.openDialog(createEditSuperNodeDialog(state, onConfirm));

}

function updateSuperNode(
  visualModel: WritableVisualModel,
  superNode: VisualSuperNode,
  nextState: EditSuperNodeDialogState,
) {
  visualModel.updateVisualEntity(superNode.identifier, {
    ...superNode,
    label: nextState.name,
    description: nextState.description,
  });
}