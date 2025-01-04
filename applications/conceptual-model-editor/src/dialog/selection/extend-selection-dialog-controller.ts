import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Selections } from "../../action/filter-selection-action";
import { ExtensionType, VisibilityFilter } from "../../action/extend-selection-action";
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
* Creates element of type {@link ExtensionData} from given arguments.
* @returns The created element
*/
const createExtensionData = (
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

  return checkboxData;
};

const createExtensionCheckboxesData = (): ExtensionData[] => {
  const extensionCheckboxesStates: ExtensionData[] = [];

  extensionCheckboxesStates.push(createExtensionData(true, "🔵⭢🔴", "extend-selection-association-target-tooltip", ExtensionType.ASSOCIATION_TARGET));
  extensionCheckboxesStates.push(createExtensionData(true, "🔴⭢🔵", "extend-selection-association-source-tooltip", ExtensionType.ASSOCIATION_SOURCE));

  extensionCheckboxesStates.push(createExtensionData(false, "🔵⇒🔴", "extend-selection-generalization-parent-tooltip", ExtensionType.GENERALIZATION_PARENT));
  extensionCheckboxesStates.push(createExtensionData(false, "🔴⇒🔵", "extend-selection-generalization-child-tooltip", ExtensionType.GENERALIZATION_CHILD));

  extensionCheckboxesStates.push(createExtensionData(false, "🔵⇢🔴", "extend-selection-association-profile-target-tooltip", ExtensionType.PROFILE_EDGE_TARGET));
  extensionCheckboxesStates.push(createExtensionData(false, "🔴⇢🔵", "extend-selection-association-profile-source-tooltip", ExtensionType.PROFILE_EDGE_SOURCE));

  extensionCheckboxesStates.push(createExtensionData(false, "🟦⇢🟥", "extend-selection-class-profile-parent-tooltip", ExtensionType.PROFILE_CLASS_PARENT));
  extensionCheckboxesStates.push(createExtensionData(false, "🟥⇢🟦", "extend-selection-class-profile-child-source-tooltip", ExtensionType.PROFILE_CLASS_CHILD));

  return extensionCheckboxesStates;
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
  const extensionCheckboxStates: ExtensionData[] = createExtensionCheckboxesData();

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

      extendSelection(
        {
          identifiers: state.selections.nodeSelection,
          areIdentifiersFromVisualModel: state.areIdentifiersFromVisualModel
        },
        relevantExtensionTypes,
        VisibilityFilter.ONLY_VISIBLE,
        null
      ).then(extension => {
        setSelections({
          nodeSelection: state.selections.nodeSelection.concat(extension.nodeSelection),
          edgeSelection: state.selections.edgeSelection.concat(extension.edgeSelection),
        });
      }).catch(console.error);
    }

    return {
      setSelections,
      setExtensionCheckboxActivness,
      performExtensionBasedOnExtensionState
    };
  }, [state, changeState, extendSelection]);
}
