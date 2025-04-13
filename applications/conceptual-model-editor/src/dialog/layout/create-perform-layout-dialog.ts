import { DialogWrapper } from "@/dialog/dialog-api";
import { PerformLayoutDialogState } from "./perform-layout-controller";
import { AlgorithmName, getDefaultUserGivenAlgorithmConfigurationsFull, UserGivenAlgorithmConfigurationsMap } from "@dataspecer/layout";
import { PerformLayoutDialog } from "./perform-layout-dialog";

// TODO RadStr: The passed in values should be from layout configuration model
export function createPerformLayoutDialogState(
  chosenAlgorithm?: AlgorithmName,
  configurationsm?: UserGivenAlgorithmConfigurationsMap,
): PerformLayoutDialogState {
  return {
    chosenAlgorithm: "elk_stress_advanced_using_clusters",
    configurations: getDefaultUserGivenAlgorithmConfigurationsFull().main,
  };
}

export const createPerformLayoutDialog = (
  state: PerformLayoutDialogState,
  onConfirm: ((state: PerformLayoutDialogState) => void) | null,
): DialogWrapper<PerformLayoutDialogState> => {
  return {
    label: "dialog.layout-visual-model.label-perform",
    component: PerformLayoutDialog,
    state,
    confirmLabel: "dialog.layout-visual-model.ok-perform",
    cancelLabel: "dialog.layout-visual-model.cancel",
    validate: () => true,
    onConfirm,
    onClose: null,
  };
};
