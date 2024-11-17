import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections, TotalFilter } from "../../action/filter-selection-action";


const TOTAL_FILTER_TO_CHECKBOX_NAME_MAP: Record<TotalFilter, string> = {
  "NORMAL-CLASS": "Include non-profile classes in result",
  "PROFILE-CLASS": "Include class profiles in result",
  "NORMAL-EDGE": "Include normal relationships (associations)",
  "PROFILE-EDGE": "Include profiled relationships",
  "GENERALIZATION": "Include generalizations",
}


type TotalFilterData = {
  checked: boolean;
  checkboxText: string;
  checkboxTooltip: string;
  totalFilterType: TotalFilter;
}

export interface FilterSelectionState {
    selections: Selections,
    setSelectionsInDiagram: (newSelections: Selections) => void;
    filters: TotalFilterData[];
}

/**
 * Creates element of type {@link TotalFilterData} from given arguments and puts it at the end of {@link checkboxStates} parameter.
 * @returns The created element
 */
const createTotalFilterDataStateAndSaveIt = (checkboxStates: TotalFilterData[], totalFilterType: TotalFilter): TotalFilterData => {
  const checkboxText = TOTAL_FILTER_TO_CHECKBOX_NAME_MAP[totalFilterType];
  const filterData = {
      checked: true,
      checkboxText,
      checkboxTooltip: "",
      totalFilterType
  };

  checkboxStates.push(filterData);
  return filterData;
};

export function createFilterSelectionState(selections: Selections, setSelectionsInDiagram: (newSelections: Selections) => void): FilterSelectionState {
  const filters: TotalFilterData[] = [];
  createTotalFilterDataStateAndSaveIt(filters, "NORMAL-CLASS");
  createTotalFilterDataStateAndSaveIt(filters, "PROFILE-CLASS");

  createTotalFilterDataStateAndSaveIt(filters, "NORMAL-EDGE");
  createTotalFilterDataStateAndSaveIt(filters, "PROFILE-EDGE");
  createTotalFilterDataStateAndSaveIt(filters, "GENERALIZATION");

  return {
    selections: selections,
    setSelectionsInDiagram: setSelectionsInDiagram,
    filters
  };
}

export interface CreateFilterSelectionControllerType {
    setSelections: (next: Selections) => void;
    setFilterActivness: (next: {index: number, isActive: boolean}) => void;
}


export function useFilterSelectionController({ state, changeState }: DialogProps<FilterSelectionState>): CreateFilterSelectionControllerType {
  return useMemo(() => {

    const setSelections = (next: Selections) => {
      // Set Removes duplicates
      next = {
        nodeSelection: [...new Set(next.nodeSelection)],
        edgeSelection: [...new Set(next.edgeSelection)],
      };
      changeState({ ...state, selections: next });
    };

    const setFilterActivness = (next: {index: number, isActive: boolean}) => {
      const newFilters = [...state.filters];
      newFilters[next.index]!.checked = next.isActive;
      changeState({ ...state, filters: newFilters });
    };

    return {
        setSelections,
        setFilterActivness
    };
  }, [state, changeState]);
}
