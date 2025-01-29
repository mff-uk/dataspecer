import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Language } from "../../application/options";

export type IdentifierAndName = {
  identifier: string,
  name: string,
};

export interface EditNodeAttributesState {
  visibleAttributes: IdentifierAndName[];
  hiddenAttributes: IdentifierAndName[];
  classIdentifier: string,
  language: Language,
}

export function createEditNodeAttributesState(
  visibleAttributes: IdentifierAndName[],
  hiddenAttributes: IdentifierAndName[],
  classIdentifier: string,
  language: Language,
): EditNodeAttributesState {
  return {
    visibleAttributes,
    hiddenAttributes,
    classIdentifier,
    language,
  };
}

// Name them explicitly, because when we use Omit, the TS can't interfere it being typeof.
export type EditNodeAttributeChangeablePartOfState = "visibleAttributes" | "hiddenAttributes";

export interface CreateEditNodeAttributesControllerType {
  moveToNewPosition: (
    sourceFieldInState: EditNodeAttributeChangeablePartOfState,
    targetFieldInState: EditNodeAttributeChangeablePartOfState,
    oldPosition: number,
    newPosition: number
  ) => void;
  addToVisibleAttributes: (newAttribute: IdentifierAndName) => void;
}

export function useEditNodeAttributesController({ state, changeState }: DialogProps<EditNodeAttributesState>): CreateEditNodeAttributesControllerType {
  return useMemo(() => {

    const moveToNewPosition = (
      sourceFieldInState: EditNodeAttributeChangeablePartOfState,
      targetFieldInState: EditNodeAttributeChangeablePartOfState,
      oldPosition: number,
      newPosition: number
    ) => {
      const isSourceSameAsTarget = sourceFieldInState === targetFieldInState;
      const nextStateForSourceFieldInState: IdentifierAndName[] = [...state[sourceFieldInState]];
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

    const addToVisibleAttributes = (newAttribute: IdentifierAndName) => {
      const nextState: EditNodeAttributesState = {
        ...state,
        visibleAttributes: state.visibleAttributes.concat(newAttribute),
      };

      changeState(nextState);
    };

    return {
      moveToNewPosition,
      addToVisibleAttributes,
    };
  }, [state, changeState]);
}
