import { Entity } from "./entity";
import { TypedObject, isTypedObject } from "./typed-object";

/**
 * Introduce observer pattern for a collection of entities.
 */
export interface ObservableEntityModel extends TypedObject {

  subscribeToChanges(listener: EntityEventListener): UnsubscribeCallback;

}

export interface EntityEventListener {

  entitiesDidChange: (created: Entity[], changed: Entity[], removed: string[]) => void;

}

export type UnsubscribeCallback = () => void;

export const ObservableEntityModelType = "observable-entity-model";

export function isObservableEntityModel(what: unknown): what is ObservableEntityModel {
  return isTypedObject(what) && what.getTypes().includes(ObservableEntityModelType);
}
