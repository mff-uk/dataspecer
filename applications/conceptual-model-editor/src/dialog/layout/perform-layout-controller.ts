import { useMemo } from "react";

import { DialogProps } from "../dialog-api";
import { AlgorithmName, UserGivenAlgorithmConfigurationsMap } from "@dataspecer/layout";

export type UserGivenAlgorithmConfigurationsMapSetter =
  (previous: UserGivenAlgorithmConfigurationsMap) => UserGivenAlgorithmConfigurationsMap;

export type UserGivenAlgorithmConfigurationsMapFieldSetter =
  <T>(fieldToSet: string, newValue: T) => UserGivenAlgorithmConfigurationsMap;

export interface PerformLayoutDialogState {

  configurations: UserGivenAlgorithmConfigurationsMap,

  chosenAlgorithm: AlgorithmName,

}

export interface PerformLayoutDialogController {

  setChosenAlgorithm: (newlyChosenAlgorithm: AlgorithmName) => void;

  setAlgorithmConfigurationValue: <T>(fieldToSet: string, newValue: T) => void

}

export function usePerformLayoutDialogController(
  { changeState }: DialogProps<PerformLayoutDialogState>,
): PerformLayoutDialogController {

  return useMemo(() => {

    const setChosenAlgorithm = (newlyChosenAlgorithm: AlgorithmName) => {
      changeState(state => ({
        ...state,
        chosenAlgorithm: newlyChosenAlgorithm,
      }));
    };

    const setAlgorithmConfigurationValue = <T>(fieldToSet: string, newValue: T) => {
      changeState(state => ({
        ...state,
        configurations: {
          ...state.configurations,
          [state.chosenAlgorithm]: {
            ...state.configurations[state.chosenAlgorithm],
            [fieldToSet]: newValue
          }
        },
      }));
    };

    return {
      setChosenAlgorithm,
      setAlgorithmConfigurationValue,
    };
  }, [changeState]);
}
