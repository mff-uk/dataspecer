import { type VisualEntities, VisualEntity } from "./visual-entity";

export interface VisualEntityModel {
    getId(): string;
    getVisualEntity(entityId: string): VisualEntity | undefined;
    getVisualEntities(): Map<string, VisualEntity>;
    addEntity(entity: Partial<Omit<VisualEntity, "id" | "type">>): void;
    updateEntity(visualEntityId: string, entity: Partial<Omit<VisualEntity, "id" | "type" | "sourceEntityId">>): void;
    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void;
    deserializeModel(data: object): VisualEntityModel;
}

export class VisualEntityModelImpl implements VisualEntityModel {
    public id: string;
    /** @internal [sourceEntityId, VisualEntity] */
    public entitiesMap: Map<string, VisualEntity> = new Map();
    /** @internal */
    public listeners: ((updated: Record<string, VisualEntity>, removed: string[]) => void)[] = [];

    constructor(modelId: string | undefined) {
        this.id = modelId ?? createId();
    }

    getId(): string {
        return this.id;
    }

    getVisualEntity(entityId: string): VisualEntity | undefined {
        return this.entitiesMap.get(entityId);
    }

    getVisualEntities(): Map<string, VisualEntity> {
        return this.entitiesMap;
    }

    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void {
        // console.log("visual-model: subscribe-to-changes: pushing a callback", callback);
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

    updateEntity(
        visualEntityId: string,
        updatedVisualEntity: Partial<Omit<VisualEntity, "id" | "type" | "sourceEntityId">>
    ) {
        const visualEntity = this.getVisualEntity(visualEntityId);
        if (!visualEntity) {
            return;
        }
        this.change(
            {
                [visualEntityId]: {
                    ...visualEntity,
                    ...updatedVisualEntity,
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

        // console.log("visual-model: change: updated", updated);

        // this.entities = { ...this.entities, ...updated };
        for (const [_, value] of Object.entries(updated)) {
            this.entitiesMap.set(value.sourceEntityId, value);
        }
        for (const removedId of removed) {
            // delete this.entities[removedId];
            this.entitiesMap.delete(removedId);
        }
        for (const listener of this.listeners) {
            // console.log("visual-model: change: listener to be called", listener, updated, removed);
            listener(updated, removed);
        }
    }

    serializeModel() {
        return {
            // TODO: fix
            type: "https://dataspecer.com/core/model-descriptor/visual-model",
            modelId: this.getId(),
            visualEntities: Object.fromEntries(this.entitiesMap.entries()),
        };
    }

    deserializeModel(data: object) {
        const modelDescriptor = data as any;
        const entities = modelDescriptor.visualEntities as Record<string, VisualEntity>;
        for (const [sourceEntityId, visualEntity] of Object.entries(entities)) {
            this.entitiesMap.set(sourceEntityId, visualEntity);
        }
        return this;
    }
}

const createId = () => (Math.random() + 1).toString(36).substring(7);
const randomPosition = () => ({ x: Math.random() * 500, y: Math.random() * 500 });
