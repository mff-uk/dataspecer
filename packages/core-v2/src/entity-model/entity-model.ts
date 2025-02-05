import { Entities, Entity } from "./entity";

/**
 * Represents a model (storage, container) that contains stand-alone, indivisible, entities.
 * Entities are identified by their unique ID.
 * @todo Some models cannot be subscribed. However, for simplicity we will not introduce an extra interface for that.
 * @example Semantic model that contains entities such as classes, relations, generalizations, etc.
 */
export interface EntityModel {

    /**
     * Returns all entities in the model.
     * Entity is a JSON object with a unique ID.
     * That is the only requirement.
     */
    getEntities(): Entities;

    /**
     * Subscribes to changes in the model.
     * Some models may not support listening to changes!
     * @param callback Function that will be called with changes. The first argument contains updated or new entities,
     * the second argument contains ids of removed entities.
     * @returns Function that can be called to unsubscribe from the changes.
     */
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void;

    /**
     * returns internal model identifier
     */
    getId(): string;

    /**
     * @returns human readable alias of the model
     */
    getAlias(): string | null;

    /**
     * Sets the alias of the model.
     */
    setAlias(alias: string | null): void;

}
