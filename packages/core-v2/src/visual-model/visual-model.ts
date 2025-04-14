import { EntityIdentifier } from "./entity-model/entity.ts";
import { EntityModel, ModelIdentifier } from "./entity-model/entity-model.ts";
import { LegacyModel } from "./entity-model/legacy-model.ts";
import { ObservableEntityModel, UnsubscribeCallback } from "./entity-model/observable-entity-model.ts";
import { SynchronousEntityModel } from "./entity-model/synchronous-entity-model.ts";
import { SynchronousWritableEntityModel } from "./entity-model/on-premise-writable-entity-model.ts";
import { TypedObject, isTypedObject } from "./entity-model/typed-object.ts";
import { HexColor, VisualEntity, VisualGroup, VisualNode, VisualProfileRelationship, VisualRelationship, VisualView } from "./visual-entity.ts";
import { SerializableModel } from "./entity-model/serializable-model.ts";
import { LabeledModel } from "./entity-model/labeled-model.ts";

export type RepresentedEntityIdentifier = string;

export enum VisualModelDataVersion {
    VERSION_0,
    /**
     * Changes from previous version:
     * - edges detected based on decimal position
     * - model assigned to UNKNOWN_MODEL
     */
    VERSION_1,
};

/**
 * Visual model is designed to allow users place a class, or profile, on a canvas.
 * This include, but is not limited to, associating position and color with an entity.
 *
 * Since the visual model capture what use see we design it as synchronous interface.
 */
export interface VisualModel extends TypedObject, LegacyModel, LabeledModel {

    /**
     * @returns Model identifier.
     */
    getIdentifier(): ModelIdentifier;

    /**
     * @returns Visual entity with given identifier or null.
     */
    getVisualEntity(identifier: EntityIdentifier): VisualEntity | null;

    /**
     * Return primary visual representations for given entity.
     * For example for a class profile returns VisualNode, not
     * VisualProfileRelationship.
     *
     * @returns Visual entities with given source entity identifier or empty array.
     */
    getVisualEntitiesForRepresented(represented: RepresentedEntityIdentifier): VisualEntity[];

    /**
     * @returns True if there exists at least one visual entity for the {@link represented}.
     */
    hasVisualEntityForRepresented(represented: RepresentedEntityIdentifier): boolean;

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
    getModelColor(identifier: ModelIdentifier): HexColor | null;

    /**
     * @returns All stored model data pairs.
     */
    getModelsData(): Map<ModelIdentifier, VisualModelData>;

    /**
     * We can use the version to perform higher level migration when needed.
     *
     * @returns Version of data content of this model was created from or latest version.
     */
    getInitialModelVersion(): VisualModelDataVersion;

}

export const VisualModelType = "visual-model";

export function isVisualModel(what: unknown): what is VisualModel {
    return isTypedObject(what) && what.getTypes().includes(VisualModelType);
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
    modelColorDidChange: (identifier: ModelIdentifier, next: HexColor | null) => void;

}

/**
 * Interface holding visual data for a model.
 */
export interface VisualModelData {

    /**
     * Identifier of represented model.
     */
    representedModel: ModelIdentifier;

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
    addVisualProfileRelationship(entity: Omit<VisualProfileRelationship, "identifier" | "type">): string;

    /**
     * @returns Identifier for the new entity.
     */
    addVisualGroup(entity: Omit<VisualGroup, "identifier" | "type">): string;

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
    setModelColor(identifier: ModelIdentifier, color: HexColor): void;

    /**
     * Delete stored information about color for given model.
     */
    deleteModelColor(identifier: ModelIdentifier): void;

    /**
     * Delete all stored information about the model.
     */
    deleteModelData(identifier: ModelIdentifier): void;

    /**
     * Set visual view information.
     * As of not we support only one view setting.
     */
    setView(view: Omit<VisualView, "identifier" | "type">): void;

}

export const WritableVisualModelType = "writable-visual-model";

export function isWritableVisualModel(what: unknown): what is WritableVisualModel {
    return isTypedObject(what) && what.getTypes().includes(WritableVisualModelType);
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
    LabeledModel,
    LegacyModel { }
