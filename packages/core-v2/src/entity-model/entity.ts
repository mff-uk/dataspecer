
export type EntityIdentifier = string;

/**
 * A JSON serializable object that represents an entity.
 * Each entity is identified by its unique ID.
 *
 * @example Semantic class, relation, generalization, etc.
 */
export interface Entity {

    id: EntityIdentifier;

    type: string[];

}

/**
 * Object containing {@link Entity}s by their iri as a key.
 */
export type Entities = Record<string, Entity>;
