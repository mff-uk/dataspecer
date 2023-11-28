/**
 * A JSON serializable object that represents an entity.
 * @example Semantic class, relation, generalization, etc.
 * Each entity is identified by its unique ID.
 */
export interface Entity {
    id: string;
    type: string[];
}

/**
 * Object containing {@link Entity}s by their iri as a key
 */
export type Entities = Record<string, Entity>;