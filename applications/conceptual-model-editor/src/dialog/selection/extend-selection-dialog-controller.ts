import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections } from "../../action/filter-selection-action";


export interface ExtendSelectionState {
    selections: Selections;
    setSelectionsInDiagram: (newSelection: Selections) => void;
}

export function createExtendSelectionState(selections: Selections, setSelectionsInDiagram: (newSelection: Selections) => void): ExtendSelectionState {
  return {
    selections: selections,
    setSelectionsInDiagram: setSelectionsInDiagram
  };
}

export interface CreateExtendSelectionControllerType {
    setSelections: (next: Selections) => void;
}


export function useExtendSelectionController({ state, changeState }: DialogProps<ExtendSelectionState>): CreateExtendSelectionControllerType {
  return useMemo(() => {

    const setSelections = (next: Selections) => {
      // Set Removes duplicates
      next = {
        nodeSelection: [...new Set(next.nodeSelection)],
        edgeSelection: [...new Set(next.edgeSelection)],
      };
      changeState({ ...state, selections: next });
      state.setSelectionsInDiagram(next);
    };

    return {
        setSelections,
    };
  }, [state, changeState]);
}
