import {SemanticModel} from "./model";
import {Entity} from "./entities";

/**
 * Implementation of {@link SemanticModel} that stores the entities in memory.
 */
export class InMemorySemanticModel implements SemanticModel {
    protected entities: Record<string, Entity> = {};
    private listeners: ((updated: Record<string, Entity>, removed: string[]) => void)[] = [];

    getEntities(): Record<string, Entity> {
        return {...this.entities};
    }

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