
/**
 * Use this as an identifier for model in Dataspecer.
 */
export type ModelDsIdentifier = string;

/**
 * Use this as an identifier for entity inside a model in Dataspecer.
 */
export type EntityDsIdentifier = string;

/**
 * Provide complete identification of an entity.
 */
export interface EntityReference {

  /**
   * Identifier of the entity.
   */
  identifier: EntityDsIdentifier,

  /**
   * Model of the entity.
   */
  model: ModelDsIdentifier,

}

/**
 * @returns True when both reference tha same object.
 */
export function isEntityReferenceEqual(left: EntityReference, right: EntityReference): boolean {
  // Check for same objects.
  if (left === right) {
    return true;
  }
  return left.identifier === right.identifier && left.model === right.model;
}

/**
 * Use this identifier to represent a missing or undefined model.
 */
export const UNDEFINED_MODEL = ":undefined-identifier:";
