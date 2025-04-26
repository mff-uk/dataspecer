import { DialogProps } from "../dialog-api";
import { SearchExternalSemanticModelState } from "./search-external-semantic-model-state";

export interface SearchExternalSemanticModelController {

  setSearch(value: string): void;

}

export function useSearchExternalSemanticModelController(
  { changeState }: DialogProps<SearchExternalSemanticModelState>,
): SearchExternalSemanticModelController {

  const setSearch = (value: string) => changeState(state => ({
    ...state,
    search: value,
  }));

  return {
    setSearch,
  };
}
