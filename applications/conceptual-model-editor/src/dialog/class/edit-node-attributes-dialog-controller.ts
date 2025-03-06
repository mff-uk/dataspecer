import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";
import { Language } from "../../configuration/options";
import { DropResult } from "@hello-pangea/dnd";
import { getLocalizedStringFromLanguageString } from "../../util/language-utils";
import { EditAttributeDialogState } from "../attribute/edit-attribute-dialog-controller";
import { EditAttributeProfileDialogState } from "../attribute-profile/edit-attribute-profile-dialog-controller";
import { useActions } from "../../action/actions-react-binding";

export type AttributeData = {
  identifier: string,
  name: string,
  profileOf: string | null,
};

export interface EditNodeAttributesState {
  visibleAttributes: AttributeData[];
  hiddenAttributes: AttributeData[];
  classIdentifier: string,
  isDomainNodeProfile: boolean,
  language: Language,
}

export function createEditNodeAttributesState(
  visibleAttributes: AttributeData[],
  hiddenAttributes: AttributeData[],
  classIdentifier: string,
  isDomainNodeProfile: boolean,
  language: Language,
): EditNodeAttributesState {
  return {
    visibleAttributes,
    hiddenAttributes,
    classIdentifier,
    isDomainNodeProfile,
    language,
  };
}

// Name them explicitly, because when we use Omit, the TS can't interfere it being typeof.
export type ChangeablePartOfEditNodeAttributeState = "visibleAttributes" | "hiddenAttributes";
export const changeablePartOfEditNodeAttributeStateAsArray = ["visibleAttributes", "hiddenAttributes"] as const;

export interface CreateEditNodeAttributesControllerType {
  /**
   * Moves entities between the {@link ChangeablePartOfEditNodeAttributeState}.
   * Concretely from {@link sourceFieldInState} to {@link targetFieldInState}.
   * So for example from hiddenAttributes into visibleAttributes.
   * Note that {@link sourceFieldInState} and {@link targetFieldInState} can be the same.
   * @param oldPosition is the position in the {@link sourceFieldInState}
   * @param newPosition is the position in the {@link targetFieldInState}
   */
  moveToNewPosition: (
    sourceFieldInState: ChangeablePartOfEditNodeAttributeState,
    targetFieldInState: ChangeablePartOfEditNodeAttributeState,
    oldPosition: number,
    newPosition: number
  ) => void;
  /**
   * Adds {@link newAttribute} to the visibleAttributes stored in state.
   */
  addToVisibleAttributes: (newAttribute: AttributeData) => void;
  /**
   * Called when new attribute is created within the edit nodes attributes dialog.
   */
  onCreateNewAttribute: () => void;
  /**
   * Handles the event dropping in the drag and drop.
   */
  handleDrop: (result: DropResult) => void;
}

export function useEditNodeAttributesController(
  { state, changeState }: DialogProps<EditNodeAttributesState>
): CreateEditNodeAttributesControllerType {

  const { openCreateAttributeDialogForClass } = useActions();
  return useMemo(() => {
    const moveToNewPosition = (
      sourceFieldInState: ChangeablePartOfEditNodeAttributeState,
      targetFieldInState: ChangeablePartOfEditNodeAttributeState,
      oldPosition: number,
      newPosition: number
    ) => {
      const isSourceSameAsTarget = sourceFieldInState === targetFieldInState;
      const nextStateForSourceFieldInState: AttributeData[] = [...state[sourceFieldInState]];
      const nextStateForTargetFieldInState = isSourceSameAsTarget ?
        nextStateForSourceFieldInState :
        [...state[targetFieldInState]];
      const [removed] = nextStateForSourceFieldInState.splice(oldPosition, 1);
      nextStateForTargetFieldInState.splice(newPosition, 0, removed);
      const nextState = {
        ...state,   // Now not necessary - only necessary if we have more than 2 fields
        [sourceFieldInState]: nextStateForSourceFieldInState,
        [targetFieldInState]: nextStateForTargetFieldInState,
      };
      changeState(nextState);
    };

    const addToVisibleAttributes = (newAttribute: AttributeData) => {
      const nextState: EditNodeAttributesState = {
        ...state,
        visibleAttributes: state.visibleAttributes.concat(newAttribute),
      };

      changeState(nextState);
    };

    const onCreateNewAttribute = () => {
      const onConfirmCallback = (
        returnedState: EditAttributeDialogState | EditAttributeProfileDialogState,
        createdAttributeIdentifier: string
      ) => {
        if(returnedState.domain.identifier !== state.classIdentifier) {
          return;
        }

        let name: string | null;
        let profileOf: string | null;

        if(state.isDomainNodeProfile) {
          returnedState = (returnedState as EditAttributeProfileDialogState);
          if(returnedState.overrideName) {
            name = getLocalizedStringFromLanguageString(returnedState.name, returnedState.language);
          }
          else {
            name = getLocalizedStringFromLanguageString(returnedState.nameSourceValue, returnedState.language);
          }

          profileOf = returnedState.profiles
            .map(profile => {
              const localizedName = getLocalizedStringFromLanguageString(profile.name, returnedState.language);
              return tryGetName(localizedName, profile.iri, profile.identifier);
            }).join(", ");
        }
        else {
          profileOf = null;
          name = getLocalizedStringFromLanguageString(returnedState.name, returnedState.language);
        }

        name = tryGetName(name, returnedState.iri, createdAttributeIdentifier);

        // We have to use timeout -
        // there is probably some issue with updating state of multiple dialogs when one closes.
        setTimeout(() => addToVisibleAttributes({
          identifier: createdAttributeIdentifier,
          name,
          profileOf
        }), 1);
      }

      openCreateAttributeDialogForClass(state.classIdentifier, onConfirmCallback);
    };

    const handleDrop = (result: DropResult) => {
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
      handleDrop,
    };
  }, [state, changeState, openCreateAttributeDialogForClass]);
}

// TODO RadStr: Probably can be solved better,
//              the issue is that we don't have the entity to call the getFallbackDisplayName method,
//              so we have to write it ourselves
function tryGetName(
  name: string | null,
  iri: string | null,
  id: string | null) {
  return name ?? iri ?? id ?? "";
}