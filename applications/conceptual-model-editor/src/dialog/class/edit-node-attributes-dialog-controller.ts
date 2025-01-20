import { useMemo } from "react";
import { type DialogProps } from "../dialog-api";

export type IdentifierAndName = {
  identifier: string,
  name: string,
};

export interface EditNodeAttributesState {
  attributes: IdentifierAndName[];
  relationships: IdentifierAndName[];
}

export function createEditNodeAttributesState(
  attributes: IdentifierAndName[],
  relationships: IdentifierAndName[],
): EditNodeAttributesState {
  return {
    attributes,
    relationships
  };
}

export interface CreateEditNodeAttributesControllerType {
  convertAttributeToRelationship: (attributeIdentifier: string) => void;
  convertRelationshipToAttribute: (relationshipIdentifier: string) => void;
  moveAttributeToNewPosition: (oldPosition: number, newPosition: number) => void;
}

export function useEditNodeAttributesController({ state, changeState }: DialogProps<EditNodeAttributesState>): CreateEditNodeAttributesControllerType {
  return useMemo(() => {

    const convertAttributeToRelationship = (attributeIdentifier: string) => {
      const movedAttributeIndex = state.attributes.findIndex(iteratedAttribute => attributeIdentifier !== iteratedAttribute.identifier);
      if(movedAttributeIndex === -1) {
        console.warn("Could not move attribute to relationships");
        return;
      }
      const newAttributes = [...state.attributes];
      newAttributes.splice(movedAttributeIndex, 1);

      const nextState = {
        relationships: [...state.relationships, state.attributes[movedAttributeIndex]],
        attributes: newAttributes,
      };

      changeState(nextState);
    };

    const convertRelationshipToAttribute = (relationshipIdentifier: string) => {
      const movedRelationshipIndex = state.relationships.findIndex(iteratedRelationship => relationshipIdentifier !== iteratedRelationship.identifier);
      if(movedRelationshipIndex === -1) {
        console.warn("Could not move attribute to relationships");
        return;
      }
      const newRelationships = [...state.relationships];
      newRelationships.splice(movedRelationshipIndex, 1);

      const nextState = {
        attributes: [...state.attributes, state.relationships[movedRelationshipIndex]],
        relationships: newRelationships,
      };

      changeState(nextState);
    };

    const moveAttributeToNewPosition = (oldPosition: number, newPosition: number) => {
      const newAttributes = [...state.attributes];
      const [removed] = newAttributes.splice(oldPosition, 1);
      newAttributes.splice(newPosition, 0, removed);
      const nextState = {
        relationships: [...state.relationships],
        attributes: newAttributes,
      };
      changeState(nextState);
    };

    return {
      convertAttributeToRelationship,
      convertRelationshipToAttribute,
      moveAttributeToNewPosition,
    };
  }, [state, changeState]);
}
