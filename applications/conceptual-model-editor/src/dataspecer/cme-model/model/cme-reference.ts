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
