import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections, SelectionsWithIdInfo, SelectionFilter } from "../../action/filter-selection-action";


const SELECTION_FILTER_TO_CHECKBOX_NAME_MAP: Record<SelectionFilter, string> = {
  [SelectionFilter.NORMAL_CLASS]: "Include non-profile classes in result",
  [SelectionFilter.PROFILE_CLASS]: "Include class profiles in result",
  [SelectionFilter.RELATIONSHIP]: "Include normal relationships (associations)",
  [SelectionFilter.RELATIONSHIP_PROFILE]: "Include profiled relationships",
  [SelectionFilter.GENERALIZATION]: "Include generalizations",
};


type SelectionFilterCheckboxData = {
  checked: boolean;
  checkboxText: string;
  checkboxTooltip: string;
  selectionFilter: SelectionFilter;
};

export interface SelectionFilterState {
  selections: SelectionsWithIdInfo,
  setSelectionsInDiagram: (newSelections: Selections) => void;
  selectionFilters: SelectionFilterCheckboxData[];
};

/**
 * Creates element of type {@link SelectionFilterCheckboxData} from given arguments and puts it at the end of {@link checkboxStates} parameter.
 * @returns The created element
 */
const createSelectionFilterCheckboxDataAndSaveIt = (
  checkboxStates: SelectionFilterCheckboxData[],
  selectionFilter: SelectionFilter
): SelectionFilterCheckboxData => {
  const checkboxText = SELECTION_FILTER_TO_CHECKBOX_NAME_MAP[selectionFilter];
  const filterData = {
      checked: true,
      checkboxText,
      checkboxTooltip: "",
      selectionFilter,
  };

  checkboxStates.push(filterData);
  return filterData;
};

export function createFilterSelectionState(
  selections: SelectionsWithIdInfo,
  setSelectionsInDiagram: (newSelections: Selections) => void
): SelectionFilterState {
  const filters: SelectionFilterCheckboxData[] = [];
  createSelectionFilterCheckboxDataAndSaveIt(filters, SelectionFilter.NORMAL_CLASS);
  createSelectionFilterCheckboxDataAndSaveIt(filters, SelectionFilter.PROFILE_CLASS);

  createSelectionFilterCheckboxDataAndSaveIt(filters, SelectionFilter.RELATIONSHIP);
  createSelectionFilterCheckboxDataAndSaveIt(filters, SelectionFilter.RELATIONSHIP_PROFILE);
  createSelectionFilterCheckboxDataAndSaveIt(filters, SelectionFilter.GENERALIZATION);

  return {
    selections,
    setSelectionsInDiagram,
    selectionFilters: filters
  };
}

export interface CreateFilterSelectionControllerType {
    setFilterActivness: (next: {index: number, isActive: boolean}) => void;
}


export function useFilterSelectionController({ state, changeState }: DialogProps<SelectionFilterState>): CreateFilterSelectionControllerType {
  return useMemo(() => {

    const setFilterActivness = (next: {index: number, isActive: boolean}) => {
      const newFilters = [...state.selectionFilters];
      newFilters[next.index]!.checked = next.isActive;
      changeState({ ...state, selectionFilters: newFilters });
    };

    return {
        setFilterActivness
    };
  }, [state, changeState]);
}
