import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";

export type IdentifierAndName = {
  identifier: string,
  name: string,
};

export interface EditNodeAttributesState {
  attributes: IdentifierAndName[];
  relationships: IdentifierAndName[];
}

export function createEditNodeAttributesState(
  attributes: IdentifierAndName[],
  relationships: IdentifierAndName[],
): EditNodeAttributesState {
  return {
    attributes,
    relationships
  };
}

export interface CreateEditNodeAttributesControllerType {
  moveToNewPosition: (
    sourceFieldInState: keyof EditNodeAttributesState,
    targetFieldInState: keyof EditNodeAttributesState,
    oldPosition: number,
    newPosition: number
  ) => void;
}

export function useEditNodeAttributesController({ state, changeState }: DialogProps<EditNodeAttributesState>): CreateEditNodeAttributesControllerType {
  return useMemo(() => {

    const moveToNewPosition = (
      sourceFieldInState: keyof EditNodeAttributesState,
      targetFieldInState: keyof EditNodeAttributesState,
      oldPosition: number,
      newPosition: number
    ) => {
      const isSourceSameAsTarget = sourceFieldInState === targetFieldInState;
      const nextStateForSourceFieldInState = [...state[sourceFieldInState]];
      const nextStateForTargetFieldInState = isSourceSameAsTarget ? nextStateForSourceFieldInState : [...state[targetFieldInState]];
      const [removed] = nextStateForSourceFieldInState.splice(oldPosition, 1);
      nextStateForTargetFieldInState.splice(newPosition, 0, removed);
      const nextState = {
        ...state,   // Now not necessary - only necessary if we have more than 2 fields
        [sourceFieldInState]: nextStateForSourceFieldInState,
        [targetFieldInState]: nextStateForTargetFieldInState,
      };
      changeState(nextState);
    };

    return {
      moveToNewPosition,
    };
  }, [state, changeState]);
}
