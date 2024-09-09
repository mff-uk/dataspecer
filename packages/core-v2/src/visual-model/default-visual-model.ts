import { LOCAL_VISUAL_MODEL } from "../model/known-models";

import { MODEL_VISUAL_TYPE, ModelVisualInformation, VISUAL_GROUP_TYPE, VISUAL_NODE_TYPE, VISUAL_RELATIONSHIP_TYPE, VisualEntity, VisualGroup, VisualNode, VisualRelationship } from "./visual-entity";
import {
  WritableVisualModel,
  OnPremiseUnderlyingVisualModel,
  VisualModelListener,
  HexColor,
  RepresentedEntityIdentifier,
  VisualModelData,
} from "./visual-model";
import { UnsubscribeCallback } from "./entity-model/observable-entity-model";
import { EntityIdentifier } from "./entity-model/entity";

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

export class DefaultVisualModel implements WritableVisualModel {

  private model: OnPremiseUnderlyingVisualModel;

  private listeners: VisualModelListener[] = [];

  private entities: Map<EntityIdentifier, VisualEntity> = new Map();

  private sourceToEntity: Map<RepresentedEntityIdentifier, EntityIdentifier> = new Map();

  private models: Map<string, VisualModelData> = new Map();

  constructor(model: OnPremiseUnderlyingVisualModel) {
    this.model = model;
    this.initialize();
  }

  /**
   * Load data from the underlying model so we can provide synchronous interface
   * on top on asynchronous model.
   */
  protected initialize() {
    const entities = this.model.getEntitiesSync();
    // TODO
  }

  getIdentifier(): string {
    return this.model.getIdentifier();
  }

  getVisualEntity(identifier: EntityIdentifier): VisualEntity | null {
    return this.entities.get(identifier) ?? null;
  }

  getVisualEntityForRepresented(represented: RepresentedEntityIdentifier): VisualEntity | null {
    const identifier = this.sourceToEntity.get(represented);
    if (identifier === undefined) {
      return null;
    }
    return this.getVisualEntity(identifier);
  }

  getVisualEntities(): Map<EntityIdentifier, VisualEntity> {
    return new Map(this.entities);
  }

  subscribeToChanges(listener: VisualModelListener): UnsubscribeCallback {
    this.listeners.push(listener);
    // Return callback to remove the listener.
    return () => {
      this.listeners = this.listeners.filter(item => item !== listener);
    };
  }

  getModelColor(identifier: string): HexColor | null {
    return this.models.get(identifier)?.color ?? null;
  }

  getModelColors(): Map<string, VisualModelData> {
    return new Map(this.models);
  }

  addVisualNode(entity: Omit<VisualNode, "id" | "type">): string {
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_NODE_TYPE],
    });
  }

  addVisualRelationship(entity: Omit<VisualRelationship, "id" | "type">): string {
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_RELATIONSHIP_TYPE],
    });
  }

  addVisualGroup(entity: Omit<VisualGroup, "id" | "identifier">): string {
    return this.model.createEntitySync({
      ...entity,
      type: [VISUAL_GROUP_TYPE],
    });
  }

  updateVisualEntity<T extends VisualEntity>(identifier: EntityIdentifier, entity: Partial<Omit<T, "id" | "type">>): void {

  }

  deleteVisualEntity(identifier: EntityIdentifier): void {
    this.model.deleteEntitySync(identifier);
  }

  setModelColor(identifier: string, color: HexColor): void {
    const entityIdentifier = modelEntityIdentifier(identifier);
    const entity = this.model.getEntitySync(entityIdentifier);
    if (entity === null) {
      // We need to create new entity.
      this.model.createEntitySync<ModelVisualInformation>({
        type: [MODEL_VISUAL_TYPE],
        model: identifier,
        color
      });
    } else {
      // Change existing entity.
      this.model.changeEntitySync<ModelVisualInformation>(entityIdentifier, { color });
    }
    // Update local state in a synchronous way.
    // We could wait for change report, but we do not need it at this point in time.
    const model = this.models.get(identifier);
    if (model === undefined) {
      this.models.set(identifier, { color });
    } else {
      model.color = color;
    }
  }

  deleteModelColor(identifier: string): void {
    const entityIdentifier = modelEntityIdentifier(identifier);
    // We know there is no data other then color.
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

}

/**
 * @returns Identifier of the entity inside the model used to store model information.
 */
const modelEntityIdentifier = (identifier: string) => {
  return identifier + "-visual-data-for-model-entity";
};
