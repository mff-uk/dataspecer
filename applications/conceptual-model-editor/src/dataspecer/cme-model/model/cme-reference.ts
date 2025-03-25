import { EntityDsIdentifier, ModelDsIdentifier } from "../../entity-model";

/**
 * Reference to an entity.
 */
export interface CmeReference {

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
 * @returns True when they reference the same object or are equal.
 */
export function isCmeReferenceEqual(
  left: CmeReference, right: CmeReference
): boolean {
  // Check for same objects.
  if (left === right) {
    return true;
  }
  return left.identifier === right.identifier && left.model === right.model;
}
