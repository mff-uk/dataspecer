import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { ModelGraphContextType, UseModelGraphContextType } from "../context/model-context";
import { DialogApiContextType } from "../dialog/dialog-service";
import { Options } from "../application";
import { UseNotificationServiceWriterType } from "../notification/notification-service-context";
import { createNewVisualModelAction } from "./create-new-visual-model-from-source-visual-model";
import { QueryParamsContextType } from "@/context/query-params-context";
import { createVisualModelDialog } from "@/dialog/visual-model/create-visual-model/edit-visual-model-dialog";
import { changeVisualModelAction } from "./change-visual-model";
import { createEditVisualModelDialogState, EditVisualModelDialogState } from "../dialog/visual-model/create-visual-model";

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

  const onConfirm = (nextState: EditVisualModelDialogState) => {
    const createdVisualModel = createNewVisualModelAction(
      notifications, graph, useGraph, visualModel, nextState.label, nodes, edges);
    if (shouldSwitchToCreatedModel) {
      if (createdVisualModel === null) {
        return;
      }
      changeVisualModelAction(
        graph, queryParamsContext,
        createdVisualModel.getIdentifier());
    }
  };

  const state = createEditVisualModelDialogState(options.language, null);
  dialogs?.openDialog(createVisualModelDialog(state, onConfirm));
}
