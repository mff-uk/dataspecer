import { Entity } from "../../entity-model/index.ts";

/**
 * A wrapper for list of entities.
 */
export interface EntityListContainer {

  /**
   * Base IRI for all relative IRIs in {@link entities}.
   */
  baseIri: string;

  /**
   * List of all entities.
   */
  entities: Entity[],

}
