import { Entity, EntityIdentifier } from "./entity";
import { isTypedObject } from "./typed-object";

/**
 * This model fits to the local machine.
 */
export interface OnPremiseEntityModel {

  /**
   * Load all entities into the model preparing it for synchronous use.
   * This method must finish before any other method from this interface is executed.
   */
  initialize(): Promise<void>;

  /**
   * @param identifier
   * @returns Null if there is no entity with given identifier.
   */
  getLocalEntity(identifier: EntityIdentifier): Entity | null;

  getLocalEntities(): Entity[];

}

export const OnPremiseEntityModelType = "on-premise-entity-model";

export function isLocalEntityModel(what: unknown): what is OnPremiseEntityModel {
  return isTypedObject(what) && what.getTypes().includes(OnPremiseEntityModelType);
}
