import { DialogApiContextType } from "@/dialog/dialog-service";
import { createPerformLayoutDialog, createPerformLayoutDialogState } from "@/dialog/layout/create-perform-layout-dialog";
import { PerformLayoutDialogState } from "@/dialog/layout/perform-layout-controller";
import { layoutGivenVisualEntitiesAdvancedAction } from "./layout-visual-model";
import { getDefaultUserGivenAlgorithmConfigurationsFull } from "@dataspecer/layout";
import { ClassesContextType } from "@/context/classes-context";
import { UseNotificationServiceWriterType } from "@/notification/notification-service-context";
import { UseDiagramType } from "@/diagram/diagram-hook";
import { ModelGraphContextType } from "@/context/model-context";
import { WritableVisualModel } from "@dataspecer/core-v2/visual-model";

/**
 * Open and handle create class dialog.
 */
export function openLayoutSelectionDialogAction(
  notifications: UseNotificationServiceWriterType,
  dialogs: DialogApiContextType,
  classes: ClassesContextType,
  diagram: UseDiagramType,
  graph: ModelGraphContextType,
  visualModel: WritableVisualModel,
  nodeSelection: string[],
  edgeSelection: string[],
) {
  const onConfirm = (state: PerformLayoutDialogState) => {
    const visualEntitiesToLayout = nodeSelection.concat(edgeSelection);
    const fullConfiguration = getDefaultUserGivenAlgorithmConfigurationsFull();
    fullConfiguration.main = state.configurations;
    fullConfiguration.chosenMainAlgorithm = state.chosenAlgorithm;
    layoutGivenVisualEntitiesAdvancedAction(
      notifications, classes, diagram, graph, visualModel,
      fullConfiguration, visualEntitiesToLayout);
  }

  const state = createPerformLayoutDialogState();
  dialogs?.openDialog(createPerformLayoutDialog(state, onConfirm));
}
