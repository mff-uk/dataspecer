import { TypedObject, isTypedObject } from "./typed-object";

/**
 * Allow for modification of entities.
 */
export interface WritableEntityModel extends TypedObject {


}

export const WritableEntityModelType = "writable-entity-model";

export function isWritableEntityModel(what: unknown): what is WritableEntityModel {
  return isTypedObject(what) && what.getTypes().includes(WritableEntityModelType);
}
