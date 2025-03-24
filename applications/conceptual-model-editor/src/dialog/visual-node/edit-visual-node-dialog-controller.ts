import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { EditVisualNodeDialogState } from "./edit-visual-node-dialog-state";

export const LEFT_ID = "left";

export const RIGHT_ID = "right";

export interface VisualNodeDialogStateController {

  /**
   * Change order in active section.
   */
  orderActive(source: number, destination: number): void;

  /**
   * Move item from inactive to active.
   */
  activate(source: number, destination: number): void;

  /**
   * Change order in inactive section.
   */
  orderInactive(source: number, destination: number): void;

  /**
   * Move item from active to inactive.
   */
  deactivate(source: number, destination: number): void;

}

export function useEditVisualNodeController(
  { changeState }: DialogProps<EditVisualNodeDialogState>
): VisualNodeDialogStateController {
  return useMemo(() => {

    const orderActive = (source: number, destination: number) => {
      if (source === destination) {
        return;
      }
      changeState(state => {
        const result = { ...state };
        result.activeContent = [...state.activeContent];
        swapArray(
          result.activeContent, source,
          result.activeContent, destination);
        return result;
      })
    };

    const activate = (source: number, destination: number) =>
      changeState(state => {
        const result = { ...state };
        result.inactiveContent = [...state.inactiveContent];
        const item = result.inactiveContent.splice(source, 1);
        result.activeContent = [
          ...state.activeContent.slice(0, destination),
          ...item,
          ...state.activeContent.slice(destination),
        ];
        return result;
      });

    const orderInactive = (source: number, destination: number) => {
      if (source === destination) {
        return;
      }
      changeState(state => {
        const result = { ...state };
        result.inactiveContent = [...state.activeContent];
        swapArray(
          result.activeContent, source,
          result.activeContent, destination);
        return result;
      })
    };

    const deactivate = (source: number, destination: number) =>
      changeState(state => {
        const result = { ...state };
        result.activeContent = [...state.activeContent];
        const item = result.activeContent.splice(source, 1);
        result.inactiveContent = [
          ...state.inactiveContent.slice(0, destination),
          ...item,
          ...state.inactiveContent.slice(destination),
        ];
        return result;
      });

    return {
      orderActive,
      activate,
      orderInactive,
      deactivate,
    };
  }, [changeState]);

  // Const { openCreateAttributeDialogForClass } = useActions();
  // return useMemo(() => {
  //   const moveToNewPosition = (
  //     sourceFieldInState: ChangeablePartOfEditNodeAttributeState,
  //     targetFieldInState: ChangeablePartOfEditNodeAttributeState,
  //     oldPosition: number,
  //     newPosition: number
  //   ) => {
  //     const isSourceSameAsTarget = sourceFieldInState === targetFieldInState;
  //     const nextStateForSourceFieldInState: ContentItem[] = [...state[sourceFieldInState]];
  //     const nextStateForTargetFieldInState = isSourceSameAsTarget ?
  //       nextStateForSourceFieldInState :
  //       [...state[targetFieldInState]];
  //     const [removed] = nextStateForSourceFieldInState.splice(oldPosition, 1);
  //     nextStateForTargetFieldInState.splice(newPosition, 0, removed);
  //     const nextState = {
  //       ...state,   // Now not necessary - only necessary if we have more than 2 fields
  //       [sourceFieldInState]: nextStateForSourceFieldInState,
  //       [targetFieldInState]: nextStateForTargetFieldInState,
  //     };
  //     changeState(nextState);
  //   };

  //   const addToVisibleAttributes = (newAttribute: ContentItem) => {
  //     const nextState: EditVisualNodeDialogState = {
  //       ...state,
  //       content: state.content.concat(newAttribute),
  //     };

  //     changeState(nextState);
  //   };

  //   const onCreateNewAttribute = () => {
  //     const onConfirmCallback = (
  //       returnedState: AttributeDialogState | AttributeProfileDialogState,
  //       createdAttributeIdentifier: string
  //     ) => {
  //       if(returnedState.domain.identifier !== state.representedEntity) {
  //         return;
  //       }

  //       let name: string | null;
  //       let profileOf: string | null;

  //       if(state.isDomainNodeProfile) {
  //         const returnedStateProfile = (returnedState as AttributeProfileDialogState);
  //         if(returnedStateProfile.overrideName) {
  //           name = getLocalizedStringFromLanguageString(returnedState.name, returnedState.language);
  //         }
  //         else {
  //           name = getLocalizedStringFromLanguageString(returnedStateProfile.nameSourceValue, returnedState.language);
  //         }

  //         profileOf = returnedStateProfile.profiles
  //           .map(profile => {
  //             const localizedName = getLocalizedStringFromLanguageString(profile.name, returnedState.language);
  //             return tryGetName(localizedName, profile.iri, profile.identifier);
  //           }).join(", ");
  //       }
  //       else {
  //         profileOf = null;
  //         name = getLocalizedStringFromLanguageString(returnedState.name, returnedState.language);
  //       }

  //       name = tryGetName(name, returnedState.iri, createdAttributeIdentifier);

  //       // We have to use timeout -
  //       // there is probably some issue with updating state of multiple dialogs when one closes.
  //       setTimeout(() => addToVisibleAttributes({
  //         identifier: createdAttributeIdentifier,
  //         name,
  //         profileOf
  //       }), 1);
  //     }

  //     openCreateAttributeDialogForClass(state.representedEntity, onConfirmCallback);
  //   };

  //   const handleDrop = (result: DropResult) => {
  //     if (!result.destination) {
  //       return;     // If dropped outside a valid drop zone
  //     }

  //     const sourceStateField = result.source.droppableId as ChangeablePartOfEditNodeAttributeState;
  //     const targetStateField = result.destination.droppableId as ChangeablePartOfEditNodeAttributeState;
  //     moveToNewPosition(sourceStateField, targetStateField, result.source.index, result.destination.index);
  //   };

  //   return {
  //     moveToNewPosition,
  //     addToVisibleAttributes,
  //     onCreateNewAttribute,
  //     handleDrop,
  //   };
  // }, [state, changeState, openCreateAttributeDialogForClass]);
}

function swapArray<T>(
  sourceItems: T[], sourceIndex: number,
  targetItems: T[], targetIndex: number,
): void {
  const temp = sourceItems[sourceIndex];
  sourceItems[sourceIndex] = targetItems[targetIndex];
  targetItems[targetIndex] = temp;
}