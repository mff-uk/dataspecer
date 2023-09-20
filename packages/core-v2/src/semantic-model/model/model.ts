import {Entity} from "./entities";

/**
 * Represents a semantic model.
 * Contains full concepts such as concepts, relations, etc.
 */
export interface SemanticModel {
    /**
     * Returns all entities in the model as a map from entity id to entity.
     */
    getEntities(): Record<string, Entity>;

    /**
     * Allows to subscribe to changes in the model.
     * @param callback Function that will be called with changes. The first argument contains updated or new entities,
     * the second argument contains ids of removed entities.
     * @returns Function that can be called to unsubscribe from the changes.
     */
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void;
}

/**
 * External model that needs to explicitly specify which entities it contains.
 */
export interface ExternalSemanticModel extends SemanticModel {
    /**
     * Adds ids of entities that are requested from the external model.
     * If the entity is already in the model, it will be ignored.
     * @param entities
     */
    addRequestedIds(entities: string[]): void;

    /**
     * Removes ids of entities that are no longer requested from the external model.
     * If the entity is not in the model, it will be ignored.
     * @param entities
     */
    deleteRequestedIds(entities: string[]): void;
}