import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createNewVisualModelAction } from "./create-new-visual-model-from-source-visual-model";
import { QueryParamsContextType } from "@/context/query-params-context";
import { createCreateVisualModelDialog, createCreateVisualModelDialogState } from "@/dialog/visual-model/create-visual-model/create-create-visual-model-dialog";
import { CreateVisualModelDialogState } from "@/dialog/visual-model/create-visual-model/create-visual-model-dialog-controller";

export function openCreateVisualModelDialogAction(
  notifications: UseNotificationServiceWriterType,
  options: Options,
  dialogs: DialogApiContextType,
  graph: ModelGraphContextType,
  useGraph: UseModelGraphContextType,
  queryParamsContext: QueryParamsContextType,
  visualModel: WritableVisualModel,
  nodes: string[],
  edges: string[],
  shouldSwitchToCreatedModel: boolean,
) {

  const onConfirm = (nextState: CreateVisualModelDialogState) => {
    const createdVisualModel = createNewVisualModelAction(
      notifications, graph, useGraph, visualModel, nextState.label, nodes, edges);
    if (shouldSwitchToCreatedModel) {
      if (createdVisualModel === null) {
        return;
      }
      graph.aggregatorView.changeActiveVisualModel(createdVisualModel.getId());
      queryParamsContext.updateViewId(createdVisualModel.getId());
    }
  };

  const state = createCreateVisualModelDialogState(options.language, null);
  dialogs?.openDialog(createCreateVisualModelDialog(state, onConfirm));
}
