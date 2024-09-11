import { LOCAL_VISUAL_MODEL } from "../model/known-models";

import { MODEL_VISUAL_TYPE, ModelVisualInformation, VISUAL_GROUP_TYPE, VISUAL_NODE_TYPE, VISUAL_RELATIONSHIP_TYPE, VisualEntity, VisualGroup, VisualNode, VisualRelationship, isModelVisualInformation, isVisualGroup, isVisualNode, isVisualRelationship } from "./visual-entity";
import {
  WritableVisualModel,
  SynchronousUnderlyingVisualModel,
  VisualModelListener,
  HexColor,
  RepresentedEntityIdentifier,
  VisualModelData,
} from "./visual-model";
import { EntityEventListener, UnsubscribeCallback } from "./entity-model/observable-entity-model";
import { Entity, EntityIdentifier } from "./entity-model/entity";

/**
 * This is how data were stored in the version one of the visualization model.
 * Later we switch to using entities and underlying model.
 */
interface VisualModelJsonSerializationV1 {

  type: typeof LOCAL_VISUAL_MODEL;

  modelId: string;

  visualEntities: Record<string, VisualEntity>;

  modelColors: Record<string, string>;

}

export class DefaultVisualModel implements WritableVisualModel, EntityEventListener {

  private model: SynchronousUnderlyingVisualModel;

  private observers: VisualModelListener[] = [];

  private entities: Map<EntityIdentifier, VisualEntity> = new Map();

  /**
   * Cached mapping from represented to entity identifiers.
   */
  private representedToEntity: Map<RepresentedEntityIdentifier, EntityIdentifier> = new Map();

  private models: Map<string, VisualModelData> = new Map();

  constructor(model: SynchronousUnderlyingVisualModel) {
    this.model = model;
    this.initialize();
    // Register for changes in the model.
    this.model.subscribeToChanges(this);
  }

  /**
   * Load data from the underlying model so we can provide synchronous interface
   * on top on asynchronous model.
   */
  protected initialize() {
    const entities = this.model.getEntitiesSync();
    for (const entity of entities) {
      // We utilize the method reacting on new entity added to the model.
      this.onEntityDidCreate(entity);
    }
  }

  getIdentifier(): string {
    return this.model.getIdentifier();
  }

  getVisualEntity(identifier: EntityIdentifier): VisualEntity | null {
    return this.entities.get(identifier) ?? null;
  }

  getVisualEntityForRepresented(represented: RepresentedEntityIdentifier): VisualEntity | null {
    const identifier = this.representedToEntity.get(represented);
    if (identifier === undefined) {
      return null;
    }
    return this.getVisualEntity(identifier);
  }

  getVisualEntities(): Map<EntityIdentifier, VisualEntity> {
    return new Map(this.entities);
  }

  subscribeToChanges(listener: VisualModelListener): UnsubscribeCallback {
    this.observers.push(listener);
    // Return callback to remove the listener.
    return () => {
      this.observers = this.observers.filter(item => item !== listener);
    };
  }

  getModelColor(identifier: string): HexColor | null {
    return this.models.get(identifier)?.color ?? null;
  }

  getModelColors(): Map<string, VisualModelData> {
    return new Map(this.models);
  }

  addVisualNode(entity: Omit<VisualNode, "identifier" | "type">): string {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_NODE_TYPE],
    });
  }

  addVisualRelationship(entity: Omit<VisualRelationship, "identifier" | "type">): string {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_RELATIONSHIP_TYPE],
    });
  }

  addVisualGroup(entity: Omit<VisualGroup, "identifier" | "identifier">): string {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_GROUP_TYPE],
    });
  }

  updateVisualEntity<T extends VisualEntity>(identifier: EntityIdentifier, entity: Partial<Omit<T, "identifier" | "type">>): void {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    this.model.changeEntitySync(identifier, entity);
  }

  deleteVisualEntity(identifier: EntityIdentifier): void {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    this.model.deleteEntitySync(identifier);
  }

  setModelColor(identifier: string, color: HexColor): void {
    const entityIdentifier = this.models.get(identifier)?.entity;
    if (entityIdentifier === undefined) {
      // We need to create new model entity.
      this.createModelEntity(identifier, color);
      return;;
    }
    const entity = this.model.getEntitySync(entityIdentifier);
    if (entity === null) {
      // We need to create new model entity.
      this.createModelEntity(identifier, color);
      return;;
    }
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    this.model.changeEntitySync<ModelVisualInformation>(entityIdentifier, { color });
  }

  protected createModelEntity(model: string, color: HexColor) : void {
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    this.model.createEntitySync<ModelVisualInformation>({
      type: [MODEL_VISUAL_TYPE],
      representedModel: model,
      color
    });
  }

  deleteModelColor(identifier: string): void {
    // We need to get entity identifier.
    const entityIdentifier = this.models.get(identifier)?.entity;
    if (entityIdentifier === undefined) {
      return;
    }
    // Now we delete the entity.
    // This will trigger update in underling model and invoke callback.
    // We react to changes using the callback.
    this.model.deleteEntitySync(entityIdentifier);
  }

  getId(): string {
    return this.model.getIdentifier();
  }

  serializeModel(): object {
    return this.model.serializeModelToApiJsonObject();
  }

  deserializeModel(value: object): this {
    this.model.deserializeModel(value);
    this.initialize();
    // In previous versions the model information was not
    // stored in an entity.
    if ((value as any).modelColors === undefined) {
      return this;
    }
    // Conversion from version 1.
    const v1 = value as VisualModelJsonSerializationV1;
    for (const [identifier, color] of Object.entries(v1.modelColors)) {
      this.setModelColor(identifier, color);
    }
    return this;
  }

  entitiesDidChange(created: Entity[], changed: Entity[], removed: string[]): void {
    created.forEach(entity => this.onEntityDidCreate(entity));
    changed.forEach(entity => this.onEntityDidChange(entity));
    removed.forEach(entity => this.onEntityDidRemoved(entity));
  }

  protected onEntityDidCreate(entity: Entity) {
    if (isVisualNode(entity)) {
      this.entities.set(entity.identifier, entity);
      this.representedToEntity.set(entity.representedEntity, entity.identifier);
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
    if (isVisualRelationship(entity)) {
      this.entities.set(entity.identifier, entity);
      this.representedToEntity.set(entity.representedRelationship, entity.identifier);
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
    if (isVisualGroup(entity)) {
      this.entities.set(entity.identifier, entity);
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
    if (isModelVisualInformation(entity)) {
      this.entities.set(entity.identifier, entity);
      this.models.set(entity.representedModel, {
        representedModel: entity.representedModel,
        entity: entity.identifier,
        color: entity.color,
      });
      this.notifyObserversOnModelChange(null, entity);
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
  }

  protected notifyObserversOnEntityChangeOrDelete(previous: VisualEntity | null, next: VisualEntity | null): void {
    this.observers.forEach(observer => observer.visualEntitiesDidChange([{ previous, next }]));
  }

  protected notifyObserversOnModelChange(previous: ModelVisualInformation | null, next: ModelVisualInformation | null) {
    if (previous?.color !== next?.color) {
      // There was a change in color.
    }
    // We know that at leas one of then is not null, unfortunately TS
    // is not capable of detecting that.
    const modelIdentifier = (previous?.representedModel ?? next?.representedModel) as string;
    const color = next?.color ?? null;
    this.observers.forEach(observer => observer.modelColorDidChange(modelIdentifier, color));
  }

  protected onEntityDidChange(entity: Entity) {
    const previous = this.entities.get(entity.identifier);
    if (isVisualNode(entity)) {

      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualRelationship(entity)) {

      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualGroup(entity)) {

      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isModelVisualInformation(entity)) {

      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
  }

  protected onEntityDidRemoved(identifier: string) {
    const previous = this.entities.get(identifier);
    if (previous === undefined) {
      // We have no previous information about the entity,
      // so we ignore the update.
      return;
    }
    // Remove the entity.
    this.entities.delete(identifier);
    if (isVisualNode(previous)) {
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
    if (isVisualRelationship(previous)) {
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
    if (isVisualGroup(previous)) {
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
    if (isModelVisualInformation(previous)) {
      // We also need to delete from model.
      this.models.delete(previous.representedModel);
      // This meas change in color.
      this.notifyObserversOnModelChange(previous, null);
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
  }
}
