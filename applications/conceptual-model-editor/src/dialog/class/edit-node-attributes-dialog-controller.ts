import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";

export interface EditNodeAttributesState {
  attributes: string[];
  relationships: string[];
}

export function createEditNodeAttributesState(
  attributes: string[],
  relationships: string[],
): EditNodeAttributesState {
  return {
    attributes,
    relationships
  };
}

export interface CreateEditNodeAttributesControllerType {
  convertAttributeToRelationship: (attribute: string) => void;
  convertRelationshipToAttribute: (relationship: string) => void;
  moveAttributeTo: (attribute: string, oldPosition: number, newPosition: number) => void;
}

export function useEditNodeAttributesController({ state, changeState }: DialogProps<EditNodeAttributesState>): CreateEditNodeAttributesControllerType {
  return useMemo(() => {

    const convertAttributeToRelationship = (attribute: string) => {
      const nextState = {
        attributes: state.attributes.filter(iteratedAttribute => attribute !== iteratedAttribute),
        relationships: [...state.relationships, attribute],
      };
      changeState(nextState);
    };

    const convertRelationshipToAttribute = (relationship: string) => {
      const nextState = {
        relationships: state.relationships.filter(iteratedRelationship => relationship !== iteratedRelationship),
        attributes: [...state.attributes, relationship],
      };
      changeState(nextState);
    };

    const moveAttributeTo = (attribute: string, oldPosition: number, newPosition: number) => {
      const newAttributes = [...state.attributes];
      newAttributes.splice(oldPosition, 1);
      newAttributes.splice(newPosition, 0, attribute);
      const nextState = {
        relationships: [...state.relationships],
        attributes: newAttributes,
      };
      changeState(nextState);
    };

    return {
      convertAttributeToRelationship,
      convertRelationshipToAttribute,
      moveAttributeTo,
    };
  }, [state, changeState]);
}
