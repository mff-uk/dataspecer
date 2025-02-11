import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { SelectionFilter, Selections, SelectionsWithIdInfo } from "../../action/filter-selection-action";

const SELECTION_FILTER_TO_CHECKBOX_TEXT_MAP: Record<SelectionFilter, string> = {
  [SelectionFilter.CLASS]: "filter-selection-class-filter-text",
  [SelectionFilter.CLASS_USAGE]: "filter-selection-class-profile-filter-text",
  [SelectionFilter.RELATIONSHIP]: "filter-selection-association-filter-text",
  [SelectionFilter.RELATIONSHIP_USAGE]: "filter-selection-association-profile-filter-text",
  [SelectionFilter.GENERALIZATION]: "filter-selection-generalization-filter-text",
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
 * Creates element of type {@link SelectionFilterCheckboxData} from given arguments.
 * @returns The created element
 */
const createSelectionFilterCheckboxData = (
  selectionFilter: SelectionFilter
): SelectionFilterCheckboxData => {
  const checkboxText = SELECTION_FILTER_TO_CHECKBOX_TEXT_MAP[selectionFilter];
  const filterData = {
    checked: true,
    checkboxText,
    checkboxTooltip: "",
    selectionFilter,
  };

  return filterData;
};

const createFilterCheckboxesData = (): SelectionFilterCheckboxData[] => {
  const filters: SelectionFilterCheckboxData[] = [];

  filters.push(createSelectionFilterCheckboxData(SelectionFilter.CLASS));
  filters.push(createSelectionFilterCheckboxData(SelectionFilter.CLASS_USAGE));

  filters.push(createSelectionFilterCheckboxData(SelectionFilter.RELATIONSHIP));
  filters.push(createSelectionFilterCheckboxData(SelectionFilter.RELATIONSHIP_USAGE));
  filters.push(createSelectionFilterCheckboxData(SelectionFilter.GENERALIZATION));

  return filters;
};

export function createFilterSelectionState(
  selections: SelectionsWithIdInfo,
  setSelectionsInDiagram: (newSelections: Selections) => void
): SelectionFilterState {
  const filters: SelectionFilterCheckboxData[] = createFilterCheckboxesData();

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
