import { isSemanticModelClass, isSemanticModelRelationship, NamedThing, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { ExternalEntityWrapped, LocalEntityWrapped, SemanticModelAggregator } from "./interfaces";
import { TupleSet } from "./utils/tuple-set";

type MergeAggregatorExternalEntityData = {
  parentModel: SemanticModelAggregator;
}

function margeNamedThing<T extends NamedThing>(things: T[]): T {
  if (things.length === 0) {
    throw new Error('Cannot merge 0 things');
  }

  if (things.length === 1) {
    return things[0];
  }

  return things.reduce((acc, thing) => ({
    ...acc,
    name: {
      ...acc?.name,
      ...thing?.name
    },
    description: {
      ...acc?.description,
      ...thing?.description
    }
  }));
}

function mergeClasses(classes: SemanticModelClass[]): SemanticModelClass {
  return margeNamedThing(classes);
}

function mergeRelationships(relationships: SemanticModelRelationship[]): SemanticModelRelationship {
  return {
    ...relationships.reduce((acc, rel) => ({...acc, ...rel})),
    ends: [
      margeNamedThing(relationships.map(r => r.ends[0])),
      margeNamedThing(relationships.map(r => r.ends[1])),
    ],
  }
}

/**
 * Merges multiple semantic model aggregators into one.
 * It has some limitations such as it cannot resolve external hierarchy queries across multiple models.
 * todo: it should be possible to implement heuristics for this if we knew which model is external and which is not.
 */
export class MergeAggregator implements SemanticModelAggregator {
  private readonly models: SemanticModelAggregator[];

  /**
   * Aggregated entities by this model - the final result.
   */
  private readonly entities: Record<string, LocalEntityWrapped> = {};
  private readonly entityToModel: TupleSet<string, SemanticModelAggregator> = new TupleSet();
  private readonly entitiesInModels: Map<SemanticModelAggregator, Record<string, LocalEntityWrapped>> = new Map();

  private readonly subscribers: Set<(updated: Record<string, LocalEntityWrapped>, removed: string[]) => void> = new Set();

  constructor(models: SemanticModelAggregator[]) {
    this.models = models;

    this.models.forEach(model => {
      this.entitiesInModels.set(model, {});
      this.update(model, model.getAggregatedEntities(), []);
      model.subscribeToChanges((updated, removed) => {
        this.update(model, updated, removed);
      });
    });
  }

  async externalEntityToLocalForSurroundings(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelRelationship>, direction: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    const [unwrappedEntity, data] = this.unwrapExternalEntity(entity);
    const unwrappedSourceSemanticModel = sourceSemanticModel.map(entity => this.unwrapExternalEntity(entity)[0]);
    const result = await data.parentModel.externalEntityToLocalForSurroundings(fromEntity, unwrappedEntity, direction, unwrappedSourceSemanticModel);
    return this.entities[result.aggregatedEntity.id];
  }

  async externalEntityToLocalForHierarchyExtension(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelClass>, isEntityMoreGeneral: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    const [unwrappedEntity, data] = this.unwrapExternalEntity(entity);
    const unwrappedSourceSemanticModel = sourceSemanticModel.map(entity => this.unwrapExternalEntity(entity)[0]);
    const result = await data.parentModel.externalEntityToLocalForHierarchyExtension(fromEntity, unwrappedEntity, isEntityMoreGeneral, unwrappedSourceSemanticModel);
    return this.entities[result.aggregatedEntity.id];
  }

  execOperation(operation: any) {
    if (this.models.length > 1) {
      throw new Error('Operation execution is not supported for multiple models');
    }

    this.models[0].execOperation(operation);
  }

  /**
   * Called when source model changes - updates local entities.
   */
  private update(model: SemanticModelAggregator, changed: Record<string, LocalEntityWrapped>, removed: string[]) {
    Object.keys(changed).forEach(id => this.entityToModel.add(id, model));
    removed.forEach(id => this.entityToModel.delete(id, model));
    Object.assign(this.entitiesInModels.get(model), changed);
    removed.forEach(id => delete this.entitiesInModels.get(model)![id]);

    // Now we can update the final result
    const toProcess = [...Object.keys(changed), ...removed];
    const updated = {};
    const removedFinal = [];
    for (const entity of toProcess) {
      const owningModels = this.entityToModel.getByFirst(entity);
      if (owningModels.length === 0) {
        delete this.entities[entity];
        removedFinal.push(entity);
      } else {
        // todo: We are merging by ID, which is wrong!
        // todo: But right now we are guaranteed that entities fro external models have ID === IRI which effectively makes this correct as we are merging duplicates
        // todo: do clever merging here if multiple models own the same entity

        const allEntities = owningModels.map(model => this.entitiesInModels.get(model)![entity]);

        if (isSemanticModelClass(allEntities[0].aggregatedEntity) && allEntities.length > 1) {
          const result = mergeClasses(allEntities.map(e => e.aggregatedEntity as SemanticModelClass));
          const wrapped = {
            ...allEntities[0],
            aggregatedEntity: result
          };
          this.entities[entity] = wrapped;
          updated[entity] = wrapped;
        } else if (isSemanticModelRelationship(allEntities[0].aggregatedEntity) && allEntities.length > 1) {
          const result = mergeRelationships(allEntities.map(e => e.aggregatedEntity as SemanticModelRelationship));
          const wrapped = {
            ...allEntities[0],
            aggregatedEntity: result
          };
          this.entities[entity] = wrapped;
          updated[entity] = wrapped;
        } else {
          this.entities[entity] = allEntities[0];
          updated[entity] = allEntities[0];
        }
      }
    }

    this.notifySubscribers(updated, removedFinal);
  }

  /**
   * Notifies all subscribers about the change that is already in entities.
   */
  private notifySubscribers(changed: typeof this.entities, removed: (keyof typeof this.entities)[]) {
    this.subscribers.forEach(subscriber => subscriber(changed, removed));
  }

  async search(searchQuery: string): Promise<ExternalEntityWrapped[]> {
    const finalResults = [];
    for (const model of this.models) {
      const result = await model.search(searchQuery);
      const metadata = {
        parentModel: model
      } satisfies MergeAggregatorExternalEntityData;
      finalResults.push(...result.map(entity => ({
        ...entity,
        originatingModel: [...entity.originatingModel, metadata]
      })));
    }

    return finalResults;
  }

  async externalEntityToLocalForSearch(entity: ExternalEntityWrapped): Promise<LocalEntityWrapped> {
    const [unwrappedEntity, data] = this.unwrapExternalEntity(entity);

    const localEntity = await data.parentModel.externalEntityToLocalForSearch(unwrappedEntity);
    return this.entities[localEntity.aggregatedEntity.id];
  }

  async getHierarchy(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    const finalResults = [];
    for (const model of this.models) {
      const result = await model.getHierarchy(localEntityId);
      if (result) {
        const metadata = {
          parentModel: model
        } satisfies MergeAggregatorExternalEntityData;
        finalResults.push(...result.map(entity => ({
          ...entity,
          originatingModel: [...entity.originatingModel, metadata]
        })));
      }
    }
    return finalResults;
  }

  async getHierarchyForLookup(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    const finalResults = [];
    for (const model of this.models) {
      const result = await model.getHierarchyForLookup(localEntityId);
      if (result) {
        const metadata = {
          parentModel: model
        } satisfies MergeAggregatorExternalEntityData;
        finalResults.push(...result.map(entity => ({
          ...entity,
          originatingModel: [...entity.originatingModel, metadata]
        })));
      }
    }
    return finalResults;
  }

  async getSurroundings(localOrExternalEntityId: string): Promise<ExternalEntityWrapped[]> {
    const finalResults = [];
    for (const model of this.models) {
      const result = await model.getSurroundings(localOrExternalEntityId);
      if (result) {
        const metadata = {
          parentModel: model
        } satisfies MergeAggregatorExternalEntityData;
        finalResults.push(...result.map(entity => ({
          ...entity,
          originatingModel: [...entity.originatingModel, metadata]
        })));
      }
    }
    return finalResults;
  }

  private unwrapExternalEntity<T extends SemanticModelEntity>(entity: ExternalEntityWrapped<T>): [ExternalEntityWrapped<T>, MergeAggregatorExternalEntityData] {
    const unwrappedEntity = {
      ...entity,
      originatingModel: [...entity.originatingModel].splice(-1)
    };

    const data = entity.originatingModel[entity.originatingModel.length - 1] as MergeAggregatorExternalEntityData;

    return [unwrappedEntity, data];
  }

  getLocalEntity(id: string): LocalEntityWrapped | null {
    return this.entities[id] ?? null;
  }

  subscribeToChanges(callback: (updated: Record<string, LocalEntityWrapped>, removed: string[]) => void) {
    this.subscribers.add(callback);
  }

  getAggregatedEntities(): Record<string, LocalEntityWrapped> {
    return this.entities;
  }
}