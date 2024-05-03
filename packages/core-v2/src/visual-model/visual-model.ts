import { LOCAL_VISUAL_MODEL } from "../model/known-models";
import { type VisualEntities, VisualEntity } from "./visual-entity";

export interface VisualEntityModel {
    getId(): string;
    getVisualEntity(entityId: string): VisualEntity | undefined;
    getVisualEntities(): Map<string, VisualEntity>;
    addEntity(entity: Partial<Omit<VisualEntity, "id" | "type">>): void;
    updateEntity(
        visualEntityId: string,
        entity: Partial<Omit<VisualEntity, "id" | "type" | "sourceEntityId">>
    ): boolean;
    subscribeToChanges(callback: (updated: Record<string, VisualEntity>, removed: string[]) => void): () => void;
    deserializeModel(data: object): VisualEntityModel;

    getColor(semModelId: string): string | undefined;
    setColor(semModelId: string, hexColor: string): void;

    /** [modelId: string, hexColor: string] */
    getModelColorPairs(): [string, string][];
}

export class VisualEntityModelImpl implements VisualEntityModel {
    private iri: string;
    /** [modelId: string, hexColor: string] */
    private modelColors: Map<string, string> = new Map();
    /** @internal [sourceEntityId, VisualEntity] */
    public entitiesMap: Map<string, VisualEntity> = new Map();
    /** @internal */
    public listeners: ((updated: Record<string, VisualEntity>, removed: string[]) => void)[] = [];

    constructor(modelId: string | undefined) {
        console.log("visual model being created");
        console.trace();
        this.iri = modelId ?? createId();
    }

    getId(): string {
        return this.iri;
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
            return false;
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
        return true;
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
            type: LOCAL_VISUAL_MODEL,
            modelId: this.getId(),
            visualEntities: Object.fromEntries(this.entitiesMap.entries()),
            modelColors: Object.fromEntries(this.modelColors.entries()),
        };
    }

    deserializeModel(data: object) {
        const modelDescriptor = data as any;
        const entities = modelDescriptor.visualEntities as Record<string, VisualEntity>;
        for (const [sourceEntityId, visualEntity] of Object.entries(entities)) {
            this.entitiesMap.set(sourceEntityId, visualEntity);
        }
        const colors = (modelDescriptor.modelColors ?? {}) as Record<string, string>;
        for (const [modelId, color] of Object.entries(colors)) {
            this.modelColors.set(modelId, color);
        }
        return this;
    }

    getColor(modelId: string) {
        return this.modelColors.get(modelId);
    }

    setColor(modelId: string, hexColor: string) {
        // TODO: sanitize
        this.modelColors.set(modelId, hexColor);
        this.change(
            Object.fromEntries(
                [...this.entitiesMap.entries()].map(([sourceEntityId, entity]) => [
                    entity.id,
                    {
                        id: entity.id,
                        type: ["visual-entity"],
                        sourceEntityId: sourceEntityId,
                        visible: entity.visible ?? true,
                        position: entity.position ?? randomPosition(),
                        hiddenAttributes: entity.hiddenAttributes ?? [],
                    },
                ])
            ),
            []
        );
    }

    getModelColorPairs(): [string, string][] {
        return [...this.modelColors.entries()];
    }
}

export function isVisualModel(what: object): what is VisualEntityModel {
    return (what as VisualEntityModel).getVisualEntities !== undefined;
}

const createId = () => (Math.random() + 1).toString(36).substring(7);
const randomPosition = () => ({ x: Math.random() * 500, y: Math.random() * 500 });
