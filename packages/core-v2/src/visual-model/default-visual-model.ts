import { LOCAL_VISUAL_MODEL } from "../model/known-models";

import {
  MODEL_VISUAL_TYPE,
  ModelVisualInformation,
  UNKNOWN_ENTITY,
  UNKNOWN_MODEL,
  VISUAL_GROUP_TYPE,
  VISUAL_NODE_TYPE,
  VISUAL_PROFILE_RELATIONSHIP_TYPE,
  VISUAL_RELATIONSHIP_TYPE,
  VISUAL_VIEW_TYPE,
  VisualEntity,
  VisualGroup,
  VisualNode,
  VisualProfileRelationship,
  VisualRelationship,
  VisualView,
  isModelVisualInformation,
  isVisualGroup,
  isVisualNode,
  isVisualProfileRelationship,
  isVisualRelationship,
  isVisualView,
} from "./visual-entity";
import {
  WritableVisualModel,
  SynchronousUnderlyingVisualModel,
  VisualModelListener,
  RepresentedEntityIdentifier,
  VisualModelData,
  VisualModelType,
  WritableVisualModelType,
  VisualModelDataVersion,
} from "./visual-model";
import { HexColor } from "./visual-entity";
import { EntityEventListener, UnsubscribeCallback } from "./entity-model/observable-entity-model";
import { Entity, EntityIdentifier } from "./entity-model/entity";
import { LanguageString } from "./entity-model/labeled-model";
import { addToMapArray, removeFromMapArray } from "../utils/functional";

/**
 * This is how data were stored in the initial version of the visual model.
 */
interface VisualModelJsonSerializationV0 {

  type: typeof LOCAL_VISUAL_MODEL;

  modelId: string;

  modelAlias?: string;

  visualEntities: Record<string, VisualModelEntityV0>;

  modelColors: Record<string, string>;

}

const VISUAL_ENTITY_V0_TYPE = "visual-entity";

interface VisualModelEntityV0 {

  id: string;

  type: string[];

  sourceEntityId: string;

  visible: boolean | undefined;

  position: { x: number, y: number };

  hiddenAttributes: [];

}

export class DefaultVisualModel implements WritableVisualModel, EntityEventListener {

  private model: SynchronousUnderlyingVisualModel;

  private observers: VisualModelListener[] = [];

  /**
   * Map of all visual entities in the {@link model}.
   */
  private entities: Map<EntityIdentifier, VisualEntity> = new Map();

  /**
   * Cached mapping from represented to entity identifiers.
   */
  private representedToEntity: Map<RepresentedEntityIdentifier, EntityIdentifier[]> = new Map();

  /**
   * Map from model identifier to the model data.
   */
  private models: Map<string, VisualModelData> = new Map();

  /**
   * When model is loaded version of the source data is saved here.
   * This allows for additional migration on higher level.
   */
  private sourceDataVersion: VisualModelDataVersion = VisualModelDataVersion.VERSION_1;

  /**
   * Cached visual view identifier or null when there is no such entity.
   */
  private visualViewIdentifier: string | null = null;

  constructor(model: SynchronousUnderlyingVisualModel) {
    this.model = model;
    this.loadFromEntities();
    // Register for changes in the model.
    this.model.subscribeToChanges(this);
  }

  getTypes(): string[] {
    return [VisualModelType, WritableVisualModelType];
  }

  /**
   * Load data from the underlying model so we can provide synchronous interface
   * on top on asynchronous model.
   */
  protected loadFromEntities() {
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

  getVisualEntitiesForRepresented(represented: RepresentedEntityIdentifier): VisualEntity[] {
    const identifiers = this.representedToEntity.get(represented);
    if (identifiers === undefined) {
      return [];
    }
    const visualEntities = identifiers
      .map(identifier => this.getVisualEntity(identifier))
      .filter(visualEntity => visualEntity !== null);
    return visualEntities;
  }

  hasVisualEntityForRepresented(represented: RepresentedEntityIdentifier): boolean {
    const identifiers = this.representedToEntity.get(represented);
    // I think that technically the identifiers should never have length 0,
    // but the check costs very little, so it is better to be sure.
    return identifiers !== undefined && identifiers.length > 0;
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

  getModelsData(): Map<string, VisualModelData> {
    return new Map(this.models);
  }

  getInitialModelVersion(): VisualModelDataVersion {
    return this.sourceDataVersion;
  }

  getLabel(): LanguageString | null {
    return this.model.getLabel();
  }

  setLabel(label: LanguageString | null): void {
    this.model.setLabel(label);
  }

  addVisualNode(entity: Omit<VisualNode, "identifier" | "type">): string {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_NODE_TYPE],
    });
  }

  addVisualRelationship(entity: Omit<VisualRelationship, "identifier" | "type">): string {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_RELATIONSHIP_TYPE],
    });
  }

  addVisualProfileRelationship(entity: Omit<VisualProfileRelationship, "identifier" | "type">): string {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_PROFILE_RELATIONSHIP_TYPE],
    });
  }

  addVisualGroup(entity: Omit<VisualGroup, "identifier" | "identifier">): string {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_GROUP_TYPE],
    });
  }

  updateVisualEntity<T extends VisualEntity>(identifier: EntityIdentifier, entity: Partial<Omit<T, "identifier" | "type">>): void {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    this.model.changeEntitySync(identifier, entity);
  }

  deleteVisualEntity(identifier: EntityIdentifier): void {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    this.model.deleteEntitySync(identifier);
  }

  setModelColor(identifier: string, color: HexColor): void {
    const entityIdentifier = this.models.get(identifier)?.entity;
    if (entityIdentifier === undefined) {
      // We need to create new model entity.
      this.createModelEntity(identifier, color);
      return;
    }
    const entity = this.model.getEntitySync(entityIdentifier);
    if (entity === null) {
      // We need to create new model entity.
      this.createModelEntity(identifier, color);
      return;
    }
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    this.model.changeEntitySync<ModelVisualInformation>(entityIdentifier, { color });
  }

  protected createModelEntity(model: string, color: HexColor): void {
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    // The same way to create a ModelVisualInformation is used in the
    // deserializeModelV0 method!
    this.model.createEntitySync<ModelVisualInformation>({
      type: [MODEL_VISUAL_TYPE],
      representedModel: model,
      color
    });
  }

  deleteModelColor(identifier: string): void {
    // There is only color, so we delete the entity.
    this.deleteModelData(identifier);
  }

  deleteModelData(identifier: string): void {
    // We need to get entity identifier.
    const entityIdentifier = this.models.get(identifier)?.entity;
    if (entityIdentifier === undefined) {
      return;
    }
    // Now we delete the entity.
    // This will trigger update in underlying model and invoke callback.
    // We react to changes using the callback.
    this.model.deleteEntitySync(entityIdentifier);
  }

  setView(view: Omit<VisualView, "identifier" | "type">): void {
    if (this.visualViewIdentifier === null) {
      this.visualViewIdentifier = this.model.createEntitySync({
        ...view,
        type: [VISUAL_VIEW_TYPE],
      });
    } else {
      this.model.changeEntitySync(this.visualViewIdentifier, {
        ...view,
        type: [VISUAL_VIEW_TYPE],
      });
    }
  }

  getId(): string {
    return this.model.getIdentifier();
  }

  serializeModel(): object {
    return this.model.serializeModelToApiJsonObject();
  }

  deserializeModel(value: object): this {
    if (isEntityModelV0(value)) {
      this.sourceDataVersion = VisualModelDataVersion.VERSION_0;
      this.deserializeModelV0(value);
    } else {
      this.sourceDataVersion = VisualModelDataVersion.VERSION_1;
      this.deserializeModelV1(value);
    }
    return this;
  }

  protected deserializeModelV0(value: VisualModelJsonSerializationV0): void {
    // We can not pass the model to the internal entity directly.
    // So we perform a migration here instead.
    const migratedEntities: VisualEntity[] = [];
    for (const [identifier, entity] of Object.entries(value.visualEntities)) {
      if (!entity.type.includes(VISUAL_ENTITY_V0_TYPE)) {
        console.error("Removing unknown visual entity.", { entity });
        continue;
      }
      if (entity.visible === false) {
        // We removed hidden entities.
        continue;
      }
      // This can represent a node or an edge.
      // The best to tell the difference is using a position.
      const isNode =
        entity.position.x === Math.ceil(entity.position.x) &&
        entity.position.y === Math.ceil(entity.position.y);
      if (isNode) {
        const migratedNode: VisualNode = {
          identifier,
          type: [VISUAL_NODE_TYPE],
          //
          representedEntity: entity.sourceEntityId,
          model: UNKNOWN_MODEL,
          content: [],
          visualModels: [],
          position: { ...entity.position, anchored: null },
        };
        migratedEntities.push(migratedNode);
      } else {
        const migratedRelationship: VisualRelationship = {
          identifier,
          type: [VISUAL_RELATIONSHIP_TYPE],
          //
          representedRelationship: entity.sourceEntityId,
          model: UNKNOWN_MODEL,
          waypoints: [],
          visualSource: UNKNOWN_ENTITY,
          visualTarget: UNKNOWN_ENTITY,
        };
        migratedEntities.push(migratedRelationship);
      }
    }
    const migratedValue = {
      identifier: value.modelId,
      type: value.type,
      entities: migratedEntities,
    }
    // Load migrated content.
    this.model.deserializeModel(migratedValue);
    // And initialize the model.
    this.loadFromEntities();
    // Migrate colors colors.
    for (const [identifier, color] of Object.entries(value.modelColors)) {
      this.setModelColor(identifier, color);
    }
    // Migrate label.
    this.model.setLabel({ "en": value.modelAlias ?? "Anonymous model" });
    // Print debug information about migration
    console.log("Visual model migration done.", { v0: value, current: this.model.getEntitiesSync() })
  }

  protected deserializeModelV1(value: object): void {
    // We just load the entities.
    this.model.deserializeModel(value);
    // And initialize the model.
    this.loadFromEntities();
  }

  entitiesDidChange(created: Entity[], changed: Entity[], removed: string[]): void {
    created.forEach(entity => this.onEntityDidCreate(entity));
    changed.forEach(entity => this.onEntityDidChange(entity));
    removed.forEach(entity => this.onEntityDidRemoved(entity));
  }

  protected onEntityDidCreate(entity: Entity) {
    if (isVisualNode(entity)) {
      this.entities.set(entity.identifier, entity);
      addToMapArray(entity.representedEntity, entity.identifier, this.representedToEntity);
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
    if (isVisualRelationship(entity)) {
      this.entities.set(entity.identifier, entity);
      addToMapArray(entity.representedRelationship, entity.identifier, this.representedToEntity);
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
    if (isVisualProfileRelationship(entity)) {
      this.entities.set(entity.identifier, entity);
      // There is no primary representation for this one.
      this.notifyObserversOnEntityChangeOrDelete(null, entity);
    }
    if (isVisualView(entity)) {
      this.entities.set(entity.identifier, entity);
      this.visualViewIdentifier = entity.identifier;
    }
  }

  protected notifyObserversOnEntityChangeOrDelete(previous: VisualEntity | null, next: VisualEntity | null): void {
    this.observers.forEach(observer => observer.visualEntitiesDidChange([{ previous, next }]));
  }

  protected notifyObserversOnModelChange(previous: ModelVisualInformation | null, next: ModelVisualInformation | null) {
    // We know that at leas one of then is not null, unfortunately TS
    // is not capable of detecting that.
    const modelIdentifier = (previous?.representedModel ?? next?.representedModel) as string;
    const color = next?.color ?? null;
    this.observers.forEach(observer => observer.modelColorDidChange(modelIdentifier, color));
  }

  protected onEntityDidChange(entity: Entity) {
    const previous = this.entities.get(entity.identifier);
    if (isVisualNode(entity)) {
      this.entities.set(entity.identifier, entity);
      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualRelationship(entity)) {
      this.entities.set(entity.identifier, entity);
      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualGroup(entity)) {
      this.entities.set(entity.identifier, entity);
      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isModelVisualInformation(entity)) {
      this.entities.set(entity.identifier, entity);
      this.models.set(entity.representedModel, {
        color: entity.color,
        entity: entity.identifier,
        representedModel: entity.representedModel,
      });
      this.notifyObserversOnModelChange(previous as ModelVisualInformation, entity);
      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualProfileRelationship(entity)) {
      this.entities.set(entity.identifier, entity);
      this.notifyObserversOnEntityChangeOrDelete(previous as VisualEntity, entity);
    }
    if (isVisualView(entity)) {
      this.entities.set(entity.identifier, entity);
      this.visualViewIdentifier = entity.identifier;
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
    // Remove the entity from internal structures.
    this.entities.delete(identifier);
    // Notify listeners.
    if (isVisualNode(previous)) {
      removeFromMapArray(this.representedToEntity, previous.representedEntity, identifier);
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
    if (isVisualRelationship(previous)) {
      removeFromMapArray(this.representedToEntity, previous.representedRelationship, identifier);
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
    if (isVisualProfileRelationship(previous)) {
      this.notifyObserversOnEntityChangeOrDelete(previous, null);
    }
    if (isVisualView(previous)) {
      this.visualViewIdentifier = null;
    }
  }
}

function isEntityModelV0(what: object): what is VisualModelJsonSerializationV0 {
  return (what as any).modelColors !== undefined || (what as any).visualEntities !== undefined;
}

function addToMultimap<K, V>(key: K, value: V, map: Map<K, V[]>): void {
  const items = map.get(key);
  if (items === undefined) {
    map.set(key, [value]);
  } else {
    items.push(value);
  }
}
