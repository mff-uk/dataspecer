import { Entity } from "../../entity-model";

/**
 * A wrapper for list of entities used for a conversion.
 */
export interface EntityListContainer {

  /**
   * Model base URL.
   */
  baseIri: string | null;

  /**
   * List of all entities.
   */
  entities: Entity[],

}
