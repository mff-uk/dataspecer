import {Entity} from "./entity";
import {EntityModel} from "./model";

export class InMemoryEntityModel implements EntityModel {
    protected entities: Record<string, Entity> = {};
    protected listeners: ((updated: Record<string, Entity>, removed: string[]) => void)[] = [];

    /**
     * Returns all entities in the model as a map from entity id to entity.
     */
    getEntities(): Record<string, Entity> {
        return {...this.entities};
    }

    /**
     * Allows to subscribe to changes in the model.
     * @param callback Function that will be called with changes. The first argument contains updated or new entities,
     * the second argument contains ids of removed entities.
     * @returns Function that can be called to unsubscribe from the changes.
     */
    subscribeToChanges(callback: (updated: Record<string, Entity>, removed: string[]) => void): () => void {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        }
    }

    protected change(updated: Record<string, Entity>, removed: string[]) {
        this.entities = {...this.entities, ...updated};
        for (const removedId of removed) {
            delete this.entities[removedId];
        }
        for (const listener of this.listeners) {
            listener(updated, removed);
        }
    }
}