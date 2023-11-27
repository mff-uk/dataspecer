import {Entity} from "./entity";
import {EntityModel} from "./entity-model";

/**
 * Implementation of the entity model that stores entities in the memory.
 */
export class InMemoryEntityModel implements EntityModel {
    /** @internal */
    public entities: Record<string, Entity> = {};
    /** @internal */
    public listeners: ((updated: Record<string, Entity>, removed: string[]) => void)[] = [];

    getEntities(): Record<string, Entity> {
        return {...this.entities};
    }

    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        }
    }

    /**
     * Helper function to change the entities and properly notify all listeners.
     * @param updated
     * @param removed
     */
    public change(updated: Record<string, Entity>, removed: string[]) {
        // Filter removed entities from updated
        removed = removed.filter(iri => updated[iri] === undefined);

        this.entities = {...this.entities, ...updated};
        for (const removedId of removed) {
            delete this.entities[removedId];
        }
        for (const listener of this.listeners) {
            listener(updated, removed);
        }
    }
}