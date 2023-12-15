import { type VisualEntities, VisualEntity } from "./visual-entity";

export interface VisualEntityModel {
    getId(): string;
    getEntity(entityId: string): VisualEntity | undefined;
    getEntities(): Record<string, VisualEntity>;
    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void;
}

export class VisualEntityModelImpl implements VisualEntityModel {
    public id: string = (Math.random() + 1).toString(36).substring(7);
    /** @internal */
    public entities: Record<string, VisualEntity> = {}; //new Map();
    /** @internal */
    public listeners: ((updated: Record<string, VisualEntity>, removed: string[]) => void)[] = [];

    getId(): string {
        return this.id;
    }

    getEntity(entityId: string): VisualEntity | undefined {
        return this.entities[entityId]; //  this.entities.get(entityId);
    }

    getEntities(): Record<string, VisualEntity> {
        return { ...this.entities }; //Object.fromEntries(this.entities);
    }

    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
        };
    }

    /**
     * Helper function to change the entities and properly notify all listeners.
     * @param updated
     * @param removed removedEntityId[]
     */
    public change(updated: Record<string, VisualEntity>, removed: string[]) {
        // Filter removed entities from updated
        removed = removed.filter((id) => updated[id] === undefined);

        this.entities = { ...this.entities, ...updated };
        for (const removedId of removed) {
            delete this.entities[removedId];
        }
        for (const listener of this.listeners) {
            listener(updated, removed);
        }
    }
}
