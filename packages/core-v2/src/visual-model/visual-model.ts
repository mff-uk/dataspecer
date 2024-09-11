import { EntityIdentifier } from "./entity-model/entity";
import { EntityModel } from "./entity-model/entity-model";
import { LegacyModel } from "./entity-model/legacy-model";
import { ObservableEntityModel, UnsubscribeCallback } from "./entity-model/observable-entity-model";
import { SynchronousEntityModel } from "./entity-model/synchronous-entity-model";
import { SynchronousWritableEntityModel } from "./entity-model/on-premise-writable-entity-model";
import { isTypedObject } from "./entity-model/typed-object";
import { HexColor, VisualEntity, VisualGroup, VisualNode, VisualRelationship } from "./visual-entity";
import { SerializableModel } from "./entity-model/serializable-model";

export type RepresentedEntityIdentifier = string;

/**
 * Visual model is designed to allow users place a class, or profile, on a canvas.
 * This include, but is not limited to, associating position and color with an entity.
 *
 * Since the visual model capture what use see we design it as synchronous interface.
 */
export interface VisualModel extends LegacyModel {

    /**
     * @returns Model identifier.
     */
    getIdentifier(): string;

    /**
     * @returns Visual entity with given identifier or null.
     */
    getVisualEntity(identifier: EntityIdentifier): VisualEntity | null;

    /**
     * @returns Entity with given source entity identifier or null.
     */
    getVisualEntityForRepresented(represented: RepresentedEntityIdentifier): VisualEntity | null;

    /**
     * @returns Snapshot of map with all entities in the model.
     */
    getVisualEntities(): Map<EntityIdentifier, VisualEntity>;

    /**
     * Subscribe to changes.
     * @returns Callback to cancel the subscription.
     */
    subscribeToChanges(listener: VisualModelListener): UnsubscribeCallback;

    /**
     * @returns Color as defined for given model or null.
     */
    getModelColor(identifier: string): HexColor | null;

    /**
     * @returns All stored model color pairs.
     */
    getModelsData(): Map<string, VisualModelData>;

}

/**
 * WARNING: The listeners are not triggered when model is changed using deserialization!
 */
export interface VisualModelListener {

    /**
     * Argument's property previous is null when entity is created.
     * Argument's property next is null when entity is deleted.
     */
    visualEntitiesDidChange: (entities: { previous: VisualEntity | null, next: VisualEntity | null }[]) => void;

    /**
     * Color is set to null, when the information about model color is removed.
     */
    modelColorDidChange: (identifier: string, next: HexColor | null) => void;

}

/**
 * Interface holding visual data for a model.
 */
export interface VisualModelData {

    /**
     * Identifier of represented model.
     */
    representedModel: string;

    /**
     * Identifier of an entity holding the model data.
     */
    entity: EntityIdentifier;

    color: HexColor | null;

}

export interface WritableVisualModel extends VisualModel {

    /**
     * @returns Identifier for the new entity.
     */
    addVisualNode(entity: Omit<VisualNode, "identifier" | "type">): string;

    /**
     * @returns Identifier for the new entity.
     */
    addVisualRelationship(entity: Omit<VisualRelationship, "identifier" | "type">): string;

    /**
     * @returns Identifier for the new entity.
     */
    addVisualGroup(entity: Omit<VisualGroup, "identifier" | "identifier">): string;

    /**
     * Perform update of a visual entity with given identifier.
     */
    updateVisualEntity<T extends VisualEntity>(identifier: EntityIdentifier, entity: Partial<Omit<T, "identifier" | "type">>): void;

    /**
     * Delete entity with given identifier.
     */
    deleteVisualEntity(identifier: EntityIdentifier): void;

    /**
     * Set color for given model.
     */
    setModelColor(identifier: string, color: HexColor): void;

    /**
     * Delete all stored information about color for given model.
     */
    deleteModelColor(identifier: string): void;

}

export const VisualModelType = "visual-model";

export function isVisualModel(what: unknown): what is VisualModel {
    return isTypedObject(what) && what.getTypes().includes(VisualModelType);
}

/**
 * Definition of a model we can use as internal model for the visual model.
 */
export interface SynchronousUnderlyingVisualModel extends
    EntityModel,
    SynchronousEntityModel,
    SynchronousWritableEntityModel,
    ObservableEntityModel,
    SerializableModel,
    LegacyModel { }
