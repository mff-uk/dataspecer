export interface Entity {
    iri: string;
    type: string[];
}

/**
 * Object containing {@link Entity}s by their iri as a key
 */
export type Entities = Record<string, Entity>;