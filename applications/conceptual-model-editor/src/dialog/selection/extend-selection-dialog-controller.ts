import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";


export interface ExtendSelectionState {
    selection: string[];
    setSelectionInDiagram: (newSelection: string[]) => void;
}

export function createExtendSelectionState(selection: string[], setSelectionInDiagram: (newSelection: string[]) => void): ExtendSelectionState {
  return {
    selection: selection,
    setSelectionInDiagram: setSelectionInDiagram
  };
}

export interface CreateExtendSelectionControllerType {
    setSelection: (next: string[]) => void;
}


export function useExtendSelectionController({ state, changeState }: DialogProps<ExtendSelectionState>): CreateExtendSelectionControllerType {
  return useMemo(() => {

    const setSelection = (next: string[]) => {
      next = [...new Set(next)];    // Remove duplicates
      changeState({ ...state, selection: next });
      state.setSelectionInDiagram(next);
    };

    return {
        setSelection,
    };
  }, [state, changeState]);
}
