import { type VisualEntities, VisualEntity } from "./visual-entity";

export interface VisualEntityModel {
    getId(): string;
    getVisualEntity(entityId: string): VisualEntity | undefined;
    getVisualEntityM(entityId: string): VisualEntity | undefined;
    getVisualEntities(): Record<string, VisualEntity>;
    getVisualEntitiesM(): Map<string, VisualEntity>;
    addEntity(entity: Partial<Omit<VisualEntity, "id" | "type">>): void;
    updateEntity(visualEntityId: string, entity: Partial<Omit<VisualEntity, "id" | "type" | "sourceEntityId">>): void;
    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void;
}

export class VisualEntityModelImpl implements VisualEntityModel {
    public id: string = createId();
    /** @internal */
    public entities: Record<string, VisualEntity> = {}; //new Map();
    /** @internal [sourceEntityId, VisualEntity] */
    public entitiesMap: Map<string, VisualEntity> = new Map();
    /** @internal */
    public listeners: ((updated: Record<string, VisualEntity>, removed: string[]) => void)[] = [];

    getId(): string {
        return this.id;
    }

    getVisualEntity(entityId: string): VisualEntity | undefined {
        return this.entities[entityId]; //  this.entities.get(entityId);
    }

    getVisualEntityM(entityId: string): VisualEntity | undefined {
        return this.entitiesMap.get(entityId);
    }

    getVisualEntities(): Record<string, VisualEntity> {
        return { ...this.entities }; //Object.fromEntries(this.entities);
    }

    getVisualEntitiesM() {
        return this.entitiesMap;
    }

    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void {
        console.log("visual-model: subscribe-to-changes: pushing a callback", callback);
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
        };
    }

    addEntity(entity: Partial<Omit<VisualEntity, "type" | "id">> & Pick<VisualEntity, "sourceEntityId">): void {
        console.log("visual-model: add-entity", entity);
        const id = createId();
        this.change(
            {
                [id]: {
                    id,
                    type: ["visual-entity"],
                    sourceEntityId: entity.sourceEntityId,
                    visible: entity.visible ?? true,
                    position: entity.position ?? randomPosition(),
                    hiddenAttributes: entity.hiddenAttributes ?? [],
                } as VisualEntity,
            },
            []
        );
    }

    updateEntity(visualEntityId: string, entity: Partial<Omit<VisualEntity, "id" | "type" | "sourceEntityId">>) {
        const currentVisualEntity = this.getVisualEntityM(visualEntityId);
        if (!currentVisualEntity) {
            return;
        }
        this.change(
            {
                [visualEntityId]: {
                    ...currentVisualEntity,
                    ...entity,
                },
            },
            []
        );
    }

    /**
     * Helper function to change the entities and properly notify all listeners.
     * @param updated
     * @param removed removedEntityId[]
     */
    public change(updated: Record<string, VisualEntity>, removed: string[]) {
        // Filter removed entities from updated
        removed = removed.filter((id) => updated[id] === undefined);

        console.log("visual-model: change: updated", updated);

        this.entities = { ...this.entities, ...updated };
        for (const [_, value] of Object.entries(updated)) {
            this.entitiesMap.set(value.sourceEntityId, value);
        }
        for (const removedId of removed) {
            delete this.entities[removedId];
            this.entitiesMap.delete(removedId);
        }
        for (const listener of this.listeners) {
            console.log("visual-model: change: listener to be called", listener, updated, removed);
            listener(updated, removed);
        }
    }
}

const createId = () => (Math.random() + 1).toString(36).substring(7);
const randomPosition = () => ({ x: Math.random() * 500, y: Math.random() * 500 });
