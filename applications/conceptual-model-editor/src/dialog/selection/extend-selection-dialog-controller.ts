import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections } from "../../action/filter-selection-action";
import { ExtensionType } from "../../action/extend-selection-action";
import { useActions } from "../../action/actions-react-binding";


/**
 * Represents one concrete data used to render checkbox for the extension.
 */
export type ExtensionCheckboxData = {
  checked: boolean;
  checkboxText: string;
  checkboxTooltip: string;
};

/**
* {@link CheckboxData} but with one additional property for the type of extension it represents
*/
export type ExtensionData = ExtensionCheckboxData & {extensionType: ExtensionType};

/**
* Creates element of type {@link ExtensionData} from given arguments and puts it at the end of {@link checkboxStates} parameter.
* @returns The created element
*/
const useCreateExtensionDataStateAndSaveIt = (
  checkboxStates: ExtensionData[],
  defaultStateValue: boolean,
  checkboxText: string,
  checkboxTooltip: string,
  extensionType: ExtensionType
): ExtensionData => {
  const checkboxData = {
      checked: defaultStateValue,
      checkboxText,
      checkboxTooltip,
      extensionType
  };

  checkboxStates.push(checkboxData);
  return checkboxData;
};

//
//

export interface ExtendSelectionState {
  selections: Selections;
  setSelectionsInDiagram: (newSelection: Selections) => void;
  areIdentifiersFromVisualModel: boolean;
  extensionCheckboxes: ExtensionData[];
}

export function createExtendSelectionState(
  selections: Selections,
  setSelectionsInDiagram: (newSelection: Selections) => void,
  areIdentifiersFromVisualModel: boolean
): ExtendSelectionState {
  const extensionCheckboxStates: ExtensionData[] = [];

  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, true, "🔵⭢🔴", "Extend by association targets", "ASSOCIATION-TARGET");
  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, true, "🔴⭢🔵", "Extend by association sources", "ASSOCIATION-SOURCE");

  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🔵⇒🔴", "Extend by generalization parents", "GENERALIZATION-PARENT");
  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🔴⇒🔵", "Extend by generalization children", "GENERALIZATION-CHILD");

  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🔵⇢🔴", "Extend by profiled edge targets", "PROFILE-EDGE-TARGET");
  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🔴⇢🔵", "Extend by profiled edge sources", "PROFILE-EDGE-SOURCE");

  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🟦⇢🟥", "Extend by profiled classes (\"Parents\")", "PROFILE-CLASS-PARENT");
  useCreateExtensionDataStateAndSaveIt(extensionCheckboxStates, false, "🟥⇢🟦", "Extend by class profiles (\"Children\")", "PROFILE-CLASS-CHILD");

  return {
    selections: selections,
    setSelectionsInDiagram: setSelectionsInDiagram,
    areIdentifiersFromVisualModel,
    extensionCheckboxes: extensionCheckboxStates,
  };
}

export interface CreateExtendSelectionControllerType {
  setSelections: (next: Selections) => void;
  setExtensionCheckboxActivness: (next: {index: number, isActive: boolean}) => void;
  performExtensionBasedOnExtensionState: () => void;
}


export function useExtendSelectionController({ state, changeState }: DialogProps<ExtendSelectionState>): CreateExtendSelectionControllerType {
  const { extendSelection } = useActions();

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

    const setExtensionCheckboxActivness = (next: {index: number, isActive: boolean}) => {
      const newExtensionCheckboxes = [...state.extensionCheckboxes];
      newExtensionCheckboxes[next.index]!.checked = next.isActive;
      changeState({ ...state, extensionCheckboxes: newExtensionCheckboxes });
    };

    const performExtensionBasedOnExtensionState = () => {
      const relevantExtensionTypes = state.extensionCheckboxes.map(checkboxState => {
        if(checkboxState.checked) {
            return checkboxState.extensionType;
        }
        return null;
      }).filter(extensionType => extensionType !== null);

      extendSelection({identifiers: state.selections.nodeSelection, areIdentifiersFromVisualModel: state.areIdentifiersFromVisualModel}, relevantExtensionTypes, "ONLY-VISIBLE", null).then(extension => {
            setSelections({
                nodeSelection: state.selections.nodeSelection.concat(extension.nodeSelection),
                edgeSelection: state.selections.edgeSelection.concat(extension.edgeSelection),
            })
        }).catch(console.error);
    }

    return {
      setSelections,
      setExtensionCheckboxActivness,
      performExtensionBasedOnExtensionState
    };
  }, [state, changeState, extendSelection]);
}
