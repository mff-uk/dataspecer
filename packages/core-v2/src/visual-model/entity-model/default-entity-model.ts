import { Entity } from "./entity";
import { EntityModel } from "./entity-model";
import { LabeledModel, LabeledModelType, LanguageString } from "./labeled-model";
import { OnPremiseEntityModel, OnPremiseEntityModelType } from "./on-premise-entity-model";
import { LegacyModel } from "./legacy-model";
import { TypedObject } from "./typed-object";
import { EntityEventListener, ObservableEntityModel, UnsubscribeCallback, ObservableEntityModelType } from "./observable-entity-model";
import { ChangeEntity, NewEntity, WritableEntityModel, WritableEntityModelType } from "./writable-entity-model";

/**
 * @deprecated We should introduce a factory class to create entity model based on package data
 */
export function createDefaultEntityModel(type: string, identifier?: string): TypedObject {
  return new DefaultEntityModel(type, identifier ?? createIdentifier());
}

class DefaultEntityModel implements EntityModel, LabeledModel, OnPremiseEntityModel, ObservableEntityModel, WritableEntityModel, LegacyModel {

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
    return Promise.resolve(this.getLocalEntity(identifier));
  }

  getTypes(): string[] {
    return [LabeledModelType, OnPremiseEntityModelType, ObservableEntityModelType, WritableEntityModelType]
  }

  getLabel(): { [language: string]: string; } | null {
    const entity = this.getLocalEntity(modelEntityIdentifier(this.identifier));
    if (entity === null) {
      return null;
    }
    const modelEntity = entity as ModelEntity;
    return modelEntity.label;
  }

  setLabel(label: { [language: string]: string; } | null): void {
    this.change(
      [], {
      [modelEntityIdentifier(this.identifier)]: {
        label: label
      },
    },
      []);
  }

  /**
   * Perform a change to the stored entities.
   *
   * @param create
   * @param change
   * @param remove
   */
  change<T extends Entity>(create: NewEntity<T>[], change: Record<string, ChangeEntity<T>>, remove: string[]): void {
    // Create.
    const created: Entity[] = []
    create.forEach(entity => {
      const identifier = createIdentifier();
      const newEntity : Entity = {
        ...entity,
        identifier,
      };
      this.entities.set(identifier, newEntity);
      created.push(newEntity);
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

  initialize(): Promise<void> {
    // There is no implementation here as all the data
    // are loaded using LegacyModel interface.
    return Promise.resolve();
  }

  getLocalEntity(identifier: string): Entity | null {
    return this.entities.get(identifier) ?? null;
  }

  getLocalEntities(): Entity[] {
    return [...this.entities.values()];
  }

  subscribeToChanges(listener: EntityEventListener): UnsubscribeCallback {
    this.listeners.push(listener);
    // Return callback to remove the listener.
    return () => this.listeners = this.listeners.filter(item => item !== listener);
  }

  modifyEntities<T extends Entity>(create: NewEntity<T>[], change: Record<string, ChangeEntity<T>>, remove: string[]): Promise<void> {
    this.change(create, change, remove);
    return Promise.resolve();
  }

  getId(): string {
    return this.getIdentifier();
  }

  serializeModel(): object {
    return {
      identifier: this.identifier,
      type: this.type,
      entities: [...this.entities.values()],
    }
  }

  deserializeModel(value: object): void {
    const payload = value as any;
    if (this.type !== payload.type) {
      throw new Error(`Models do not have same types, actual: '${this.type}', expected: '${payload.type}'.`);
    }
    this.identifier = payload.identifier;
    this.entities = new Map(Object.entries(payload.entities));
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
