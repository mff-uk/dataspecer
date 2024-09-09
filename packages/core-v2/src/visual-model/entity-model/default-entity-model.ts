import { Entity, EntityIdentifier } from "./entity";
import { EntityModel } from "./entity-model";
import { LabeledModel, LabeledModelType, LanguageString } from "./labeled-model";
import { SynchronousEntityModel, SynchronousEntityModelType } from "./synchronous-entity-model";
import { LegacyModel } from "./legacy-model";
import { EntityEventListener, ObservableEntityModel, UnsubscribeCallback, ObservableEntityModelType } from "./observable-entity-model";
import { ChangeEntity, NewEntity } from "./writable-entity-model";
import { SynchronousWritableEntityModel, SynchronousWritableEntityModelType } from "./on-premise-writable-entity-model";
import { SerializableModel, SerializableModelType } from "./serializable-model";

export interface DefaultEntityModelType extends EntityModel, LabeledModel, SynchronousEntityModel, SynchronousWritableEntityModel, ObservableEntityModel, SerializableModel, LegacyModel { }

/**
 * @deprecated We should introduce a factory class to create entity model based on package data
 */
export function createDefaultEntityModel(type: string, identifier?: string): DefaultEntityModelType {
  return new DefaultEntityModel(type, identifier ?? createIdentifier());
}

const VERSION = 0;

class DefaultEntityModel implements DefaultEntityModelType {

  protected identifier: string;

  protected type: string;

  protected entities: Map<string, Entity>;

  protected listeners: EntityEventListener[];

  constructor(type: string, identifier: string) {
    this.identifier = identifier;
    this.type = type;
    this.entities = new Map<string, Entity>();
    this.listeners = [];
  }

  getIdentifier(): string {
    return this.identifier;
  }

  getEntity(identifier: string): Promise<Entity | null> {
    return Promise.resolve(this.getEntitySync(identifier));
  }

  getTypes(): string[] {
    return [LabeledModelType, SynchronousEntityModelType, SynchronousWritableEntityModelType, ObservableEntityModelType, SerializableModelType]
  }

  getLabel(): { [language: string]: string; } | null {
    const entity = this.getEntitySync(modelEntityIdentifier(this.identifier));
    if (entity === null) {
      return null;
    }
    const modelEntity = entity as ModelEntity;
    return modelEntity.label;
  }

  setLabel(label: { [language: string]: string; } | null): void {
    const identifier = modelEntityIdentifier(this.identifier);
    const change: ChangeEntity<ModelEntity> = {
      label: label
    };
    this.change([], { [identifier]: change, }, []);
  }

  /**
   * Perform a change to the stored entities.
   *
   * @param create
   * @param change
   * @param remove
   */
  protected change<T extends Entity>(create: T[], change: Record<string, ChangeEntity<T>>, remove: string[]): void {
    // Create.
    const created: Entity[] = []
    create.forEach(entity => {
      this.entities.set(entity.identifier, entity);
      created.push(entity);
    });
    // Update.
    const changed: Entity[] = [];
    for (const [identifier, entity] of Object.entries(change)) {
      const oldEntity = this.entities.get(identifier);
      if (oldEntity === undefined) {
        console.warn("Update called for non-existing entity.", { identifier, entity });
        continue;
      }
      const newEntity: Entity = {
        ...oldEntity,
        ...entity,
        identifier,
      };
      this.entities.set(identifier, newEntity);
      created.push(newEntity);
    }
    // Delete.
    const removed: string[] = [];
    remove.forEach(identifier => {
      if (this.entities.delete(identifier)) {
        removed.push(identifier);
      }
    });
    // Notify.
    this.listeners.forEach(listener => listener.entitiesDidChange(created, changed, removed));
  }

  createEntitySync<T extends Entity>(entity: NewEntity<T>): string {
    const identifier = createIdentifier();
    this.change([{ ...entity, identifier }], {}, []);
    return identifier;
  }

  changeEntitySync<T extends Entity>(identifier: EntityIdentifier, entity: ChangeEntity<T>): void {
    this.change([], {
      [identifier]: entity,
    }, []);
  }

  deleteEntitySync(identifier: string): void {
    this.change([], {}, [identifier]);
  }

  initialize(): Promise<void> {
    // There is no implementation here as all the data
    // are loaded using LegacyModel interface.
    return Promise.resolve();
  }

  getEntitySync(identifier: string): Entity | null {
    return this.entities.get(identifier) ?? null;
  }

  getEntitiesSync(): Entity[] {
    return [...this.entities.values()];
  }

  subscribeToChanges(listener: EntityEventListener): UnsubscribeCallback {
    this.listeners.push(listener);
    // Return callback to remove the listener.
    return () => this.listeners = this.listeners.filter(item => item !== listener);
  }

  serializeModelToApiJsonObject(): object {
    return {
      identifier: this.identifier,
      version: VERSION,
      type: this.type,
      entities: [...this.entities.values()],
    }
  }

  getId(): string {
    return this.getIdentifier();
  }

  serializeModel(): object {
    return this.serializeModelToApiJsonObject();
  }

  deserializeModel(value: object): this {
    const payload = value as any;
    if (this.type !== payload.type) {
      throw new Error(`Models do not have same types, actual: '${this.type}', expected: '${payload.type}'.`);
    }
    // We need to ensure backwards compatibility here.
    this.identifier = payload.identifier ?? payload.modelId;
    this.entities = new Map(Object.entries(payload.entities));
    return this;
  }

}

const createIdentifier = () => (Math.random() + 1).toString(36).substring(7);

/**
 * @returns Identifier of the entity inside the model used to store model information.
 */
const modelEntityIdentifier = (identifier: string) => {
  return identifier + "-model-metadata-entity";
};

/**
 * Contains data about the model.
 */
interface ModelEntity extends Entity {

  label: LanguageString | null;

}
