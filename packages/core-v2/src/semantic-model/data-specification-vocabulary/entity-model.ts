import { Entity } from "../../entity-model";

/**
 * A wrapper for list of entities.
 */
export interface EntityListContainer {

  /**
   * List of all entities.
   */
  entities: Entity[],

}
