import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Language } from "../../application/options";
import { DropResult } from "@hello-pangea/dnd";
import { getStringFromLanguageStringInLang } from "../../util/language-utils";
import { EditAttributeDialogState } from "../attribute/edit-attribute-dialog-controller";
import { EditAttributeProfileDialogState } from "../attribute-profile/edit-attribute-profile-dialog-controller";
import { useActions } from "../../action/actions-react-binding";

export type IdentifierAndName = {
  identifier: string,
  name: string,
};

export interface EditNodeAttributesState {
  visibleAttributes: IdentifierAndName[];
  hiddenAttributes: IdentifierAndName[];
  classIdentifier: string,
  language: Language,
}

export function createEditNodeAttributesState(
  visibleAttributes: IdentifierAndName[],
  hiddenAttributes: IdentifierAndName[],
  classIdentifier: string,
  language: Language,
): EditNodeAttributesState {
  return {
    visibleAttributes,
    hiddenAttributes,
    classIdentifier,
    language,
  };
}

// Name them explicitly, because when we use Omit, the TS can't interfere it being typeof.
export type ChangeablePartOfEditNodeAttributeState = "visibleAttributes" | "hiddenAttributes";
export const changeablePartOfEditNodeAttributeStateAsArray = ["visibleAttributes", "hiddenAttributes"] as const

export interface CreateEditNodeAttributesControllerType {
  moveToNewPosition: (
    sourceFieldInState: ChangeablePartOfEditNodeAttributeState,
    targetFieldInState: ChangeablePartOfEditNodeAttributeState,
    oldPosition: number,
    newPosition: number
  ) => void;
  addToVisibleAttributes: (newAttribute: IdentifierAndName) => void;
  onCreateNewAttribute: () => void;
  handleDragEnd: (result: DropResult) => void;
}

export function useEditNodeAttributesController({ state, changeState }: DialogProps<EditNodeAttributesState>): CreateEditNodeAttributesControllerType {

  const { openCreateAttributeDialogForClass } = useActions();
  return useMemo(() => {
    const moveToNewPosition = (
      sourceFieldInState: ChangeablePartOfEditNodeAttributeState,
      targetFieldInState: ChangeablePartOfEditNodeAttributeState,
      oldPosition: number,
      newPosition: number
    ) => {
      const isSourceSameAsTarget = sourceFieldInState === targetFieldInState;
      const nextStateForSourceFieldInState: IdentifierAndName[] = [...state[sourceFieldInState]];
      const nextStateForTargetFieldInState = isSourceSameAsTarget ? nextStateForSourceFieldInState : [...state[targetFieldInState]];
      const [removed] = nextStateForSourceFieldInState.splice(oldPosition, 1);
      nextStateForTargetFieldInState.splice(newPosition, 0, removed);
      const nextState = {
        ...state,   // Now not necessary - only necessary if we have more than 2 fields
        [sourceFieldInState]: nextStateForSourceFieldInState,
        [targetFieldInState]: nextStateForTargetFieldInState,
      };
      changeState(nextState);
    };

    const addToVisibleAttributes = (newAttribute: IdentifierAndName) => {
      const nextState: EditNodeAttributesState = {
        ...state,
        visibleAttributes: state.visibleAttributes.concat(newAttribute),
      };

      changeState(nextState);
    };

    const onCreateNewAttribute = () => {
      const onConfirmCallback = (state: EditAttributeDialogState | EditAttributeProfileDialogState, createdAttributeIdentifier: string) => {
        const name = getStringFromLanguageStringInLang(state.name, state.language)[0] ?? createdAttributeIdentifier;
        // We have to use timeout - there is probably some issue with updating state of multiple dialogs when one closes.
        setTimeout(() => addToVisibleAttributes({
          identifier: createdAttributeIdentifier,
          name
        }), 1);
      }

      openCreateAttributeDialogForClass(state.classIdentifier, onConfirmCallback);
    };

    const handleDragEnd = (result: DropResult) => {
      if (!result.destination) {
        return;     // If dropped outside a valid drop zone
      }

      const sourceStateField = result.source.droppableId as ChangeablePartOfEditNodeAttributeState;
      const targetStateField = result.destination.droppableId as ChangeablePartOfEditNodeAttributeState;
      moveToNewPosition(sourceStateField, targetStateField, result.source.index, result.destination.index);
    };

    return {
      moveToNewPosition,
      addToVisibleAttributes,
      onCreateNewAttribute,
      handleDragEnd,
    };
  }, [state, changeState, openCreateAttributeDialogForClass]);
}
