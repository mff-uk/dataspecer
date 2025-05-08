import { DialogApiContextType } from "@/dialog/dialog-service";
import { createPerformLayoutDialog, createPerformLayoutDialogState } from "@/dialog/layout/create-perform-layout-dialog";
import { PerformLayoutDialogState } from "@/dialog/layout/perform-layout-controller";
import { layoutActiveVisualModelAction } from "./layout-visual-model";
import { getDefaultUserGivenAlgorithmConfigurationsFull } from "@dataspecer/layout";
import { ClassesContextType } from "@/context/classes-context";
import { UseNotificationServiceWriterType } from "@/notification/notification-service-context";
import { UseDiagramType } from "@/diagram/diagram-hook";
import { ModelGraphContextType } from "@/context/model-context";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

/**
 * Open layout visual model dialog. On confirm the visual model is layouted.
 */
export function openLayoutVisualModelDialogAction(
  notifications: UseNotificationServiceWriterType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  diagram: UseDiagramType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
) {
  const onConfirm = (state: PerformLayoutDialogState) => {
    const fullConfiguration = getDefaultUserGivenAlgorithmConfigurationsFull();
    fullConfiguration.main = state.configurations;
    fullConfiguration.chosenMainAlgorithm = state.chosenAlgorithm;
    layoutActiveVisualModelAction(notifications, classes, diagram, graph, visualModel, fullConfiguration);
  }

  const state = createPerformLayoutDialogState();
  dialogs?.openDialog(createPerformLayoutDialog(state, onConfirm));
}
