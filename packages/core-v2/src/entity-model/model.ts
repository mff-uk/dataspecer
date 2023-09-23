import {Entities, Entity} from "./entity";

/**
 * Represents an entity model. (For example semantic)
 * Contains entities such as concepts, relations, etc.
 */
export interface EntityModel {
    getEntities(): Entities;
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void;
}

