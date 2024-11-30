import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections } from "../../action/filter-selection-action";


export interface ExtendSelectionState {
    selections: Selections;
    setSelectionsInDiagram: (newSelection: Selections) => void;
    areIdentifiersFromVisualModel: boolean;
}

export function createExtendSelectionState(selections: Selections, setSelectionsInDiagram: (newSelection: Selections) => void, areIdentifiersFromVisualModel: boolean): ExtendSelectionState {
  return {
    selections: selections,
    setSelectionsInDiagram: setSelectionsInDiagram,
    areIdentifiersFromVisualModel
  };
}

export interface CreateExtendSelectionControllerType {
    setSelections: (next: Selections) => void;
}


export function useExtendSelectionController({ state, changeState }: DialogProps<ExtendSelectionState>): CreateExtendSelectionControllerType {
  return useMemo(() => {

    const setSelections = (next: Selections) => {
      // Using Set to remove duplicates
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
