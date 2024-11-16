import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { type DialogProps } from "../dialog-api";
import { TotalFilter } from "../../action/filter-selection-action";


type TotalFilterData = {
  checked: boolean;
  checkboxText: string;
  checkboxTooltip: string;
  totalFilterType: TotalFilter;
}

export interface FilterSelectionState {
    selection: string[];
    setSelectionInDiagram: (newSelection: string[]) => void;
    filters: TotalFilterData[];
}

/**
 * Creates element of type {@link TotalFilterData} from given arguments and puts it at the end of {@link checkboxStates} parameter.
 * @returns The created element
 */
const createTotalFilterDataStateAndSaveIt = (checkboxStates: TotalFilterData[], totalFilterType: TotalFilter): TotalFilterData => {
  const checkboxText = totalFilterType === "NORMAL" ? "Include non-profiles in result" : "Include profiles in result";
  const filterData = {
      checked: true,
      checkboxText,
      checkboxTooltip: "",
      totalFilterType
  };

  checkboxStates.push(filterData);
  return filterData;
};

export function createFilterSelectionState(selection: string[], setSelectionInDiagram: (newSelection: string[]) => void): FilterSelectionState {
  const filters: TotalFilterData[] = [];
  createTotalFilterDataStateAndSaveIt(filters, "NORMAL");
  createTotalFilterDataStateAndSaveIt(filters, "PROFILE");

  return {
    selection: selection,
    setSelectionInDiagram: setSelectionInDiagram,
    filters
  };
}

export interface CreateFilterSelectionControllerType {
    setSelection: (next: string[]) => void;
    setFilterActivness: (next: {index: number, isActive: boolean}) => void;
}


export function useFilterSelectionController({ state, changeState }: DialogProps<FilterSelectionState>): CreateFilterSelectionControllerType {
  return useMemo(() => {

    const setSelection = (next: string[]) => {
      next = [...new Set(next)];    // Removes duplicates
      changeState({ ...state, selection: next });
    };

    const setFilterActivness = (next: {index: number, isActive: boolean}) => {
      const newFilters = [...state.filters];
      newFilters[next.index]!.checked = next.isActive;
      changeState({ ...state, filters: newFilters });
    };

    return {
        setSelection,
        setFilterActivness
    };
  }, [state, changeState]);
}
