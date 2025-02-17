import { Entity } from "@dataspecer/core-v2";
import { isSemanticModelClass, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { createClass, CreatedEntityOperationResult, createRelationship } from "@dataspecer/core-v2/semantic-model/operations";
import { SourceSemanticModelInterface } from "../configuration/configuration";
import { copyInheritanceToModel } from "../operations/helper/copy-inheritance-to-model";
import { ExternalEntityWrapped, SemanticModelAggregator, LocalEntityWrapped } from "./interfaces";

export class LegacySemanticModelAggregator implements SemanticModelAggregator {
  private readonly pim: InMemorySemanticModel;
  private readonly cim: SourceSemanticModelInterface;

  private readonly aggregatedEntities: Record<string, LocalEntityWrapped> = {};
  private readonly subscribers: Set<(updated: Record<string, LocalEntityWrapped>, removed: string[]) => void> = new Set();

  constructor(pim: InMemorySemanticModel, cim: SourceSemanticModelInterface) {
    this.pim = pim;
    this.cim = cim;

    this.updateEntities(this.pim.getEntities(), []);
    this.pim.subscribeToChanges((updated, removed) => {
      this.updateEntities(updated, removed);
    });
  }

  /**
   * Helper function to trigger update of entities
   */
  private updateEntities(updated: Record<string, Entity>, removed: string[]) {
    const toChanged = {};
    const toRemoved = [];

    for (const entity of Object.values(updated)) {
      this.aggregatedEntities[entity.id] = {
        aggregatedEntity: entity as SemanticModelEntity,
        vocabularyChain: [],
        isReadOnly: true,
      };
      toChanged[entity.id] = this.aggregatedEntities[entity.id];
    }

    for (const id of removed) {
      delete this.aggregatedEntities[id];
      toRemoved.push(id);
    }

    this.subscribers.forEach((subscriber) => subscriber(toChanged, toRemoved));
  }

  async search(searchQuery: string): Promise<ExternalEntityWrapped[]> {
    const result = this.transformEntities(await this.cim.search(searchQuery));
    return result;
  }

  async externalEntityToLocalForSearch(entity: ExternalEntityWrapped): Promise<LocalEntityWrapped> {
    // We need to create a class if not exists
    const iri = entity.aggregatedEntity.iri;
    const cls = entity.aggregatedEntity as SemanticModelClass;

    let foundEntity = Object.values(this.pim.getEntities()).find((entity) => isSemanticModelClass(entity) && entity.iri === iri) as SemanticModelClass | undefined;
    if (!foundEntity) {
      const op = createClass(cls);
      const { id } = this.pim.executeOperation(op) as CreatedEntityOperationResult;
      foundEntity = this.pim.getEntities()[id] as SemanticModelClass;
    }

    return this.aggregatedEntities[foundEntity.id];
  }

  async getHierarchy(localEntityId: string): Promise<ExternalEntityWrapped[]> {
    const pim = this.aggregatedEntities[localEntityId] as LocalEntityWrapped<SemanticModelClass>;
    if (!pim) {
      throw new Error(`getHierarchy work for local entities only.` + localEntityId);
    }
    const entities = await this.cim.getFullHierarchy(pim.aggregatedEntity.iri);
    return this.transformEntities(entities);
  }

  getHierarchyForLookup(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    return this.getHierarchy(localEntityId);
  }

  async getSurroundings(localOrExternalEntityId: string): Promise<ExternalEntityWrapped[]> {
    const maybePim = this.aggregatedEntities[localOrExternalEntityId];
    if (maybePim) {
      const entities = await this.cim.getSurroundings(maybePim.aggregatedEntity.iri);
      return this.transformEntities(entities);
    } else {
      const entities = await this.cim.getSurroundings(localOrExternalEntityId);
      return this.transformEntities(entities);
    }
  }

  /**
   * Somehow creates an entity from
   * true means that the [0] end should be extended by hierarchy
   */
  async externalEntityToLocalForSurroundings(
    fromEntity: string,
    entity: ExternalEntityWrapped<SemanticModelRelationship>,
    direction: boolean,
    sourceSemanticModel: ExternalEntityWrapped[]
  ): Promise<LocalEntityWrapped> {
    const sourceModel = sourceSemanticModel.map((e) => e.aggregatedEntity);

    // Create path from the entity to the first end
    await copyInheritanceToModel(this.pim, sourceModel, fromEntity, entity.aggregatedEntity.ends[direction ? 0 : 1].concept);

    // Create the other end
    const conceptId = entity.aggregatedEntity.ends[direction ? 1 : 0].concept;
    const concept = conceptId ? sourceModel.find((e) => e.id === conceptId) : null;
    if (concept && !this.pim.getEntities()[conceptId]) {
      const op = createClass(concept);
      this.pim.executeOperation(op);
    }

    // Create the relationship
    if (!this.pim.getEntities()[entity.aggregatedEntity.id]) {
      const op = createRelationship(entity.aggregatedEntity);
      this.pim.executeOperation(op);
    }

    return this.aggregatedEntities[entity.aggregatedEntity.id];
  }

  async execOperation(operation: any) {
    return this.pim.executeOperation(operation);
  }

  private transformEntities(entities: SemanticModelEntity[]): ExternalEntityWrapped[] {
    return entities.map((entity) => ({
      aggregatedEntity: entity,
      vocabularyChain: [],
      originatingModel: [],
      isReadOnly: true,
    }));
  }

  async externalEntityToLocalForHierarchyExtension(
    fromEntity: string,
    entity: ExternalEntityWrapped<SemanticModelClass>,
    isEntityMoreGeneral: boolean,
    sourceSemanticModel: ExternalEntityWrapped[],
  ): Promise<LocalEntityWrapped> {
    const sourceModel = sourceSemanticModel.map((e) => e.aggregatedEntity);
    if (isEntityMoreGeneral) {
      await copyInheritanceToModel(this.pim, sourceModel, fromEntity, entity.aggregatedEntity.id);
    } else {
      await copyInheritanceToModel(this.pim, sourceModel, entity.aggregatedEntity.id, fromEntity);
    }
    return this.aggregatedEntities[entity.aggregatedEntity.id];
  }

  getLocalEntity(id: string): LocalEntityWrapped | null {
    return this.aggregatedEntities[id] ?? null;
  }

  getAggregatedEntities(): Record<string, LocalEntityWrapped> {
    return this.aggregatedEntities;
  }

  subscribeToChanges(callback: (updated: Record<string, LocalEntityWrapped>, removed: string[]) => void) {
    this.subscribers.add(callback);
  }
}
