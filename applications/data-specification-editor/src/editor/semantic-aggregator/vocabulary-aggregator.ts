import { Entity } from "@dataspecer/core-v2";
import { isSemanticModelClass, SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalEntityWrapped, LocalEntityWrapped, SemanticModelAggregator } from "./interfaces";
import { getSearchRelevance } from "./utils/get-search-relevance";
import { withAbsoluteIri } from "@dataspecer/core-v2/semantic-model/utils";

export class VocabularyAggregator implements SemanticModelAggregator {
  private readonly vocabulary: InMemorySemanticModel;
  private readonly entities: Record<string, LocalEntityWrapped> = {};
  private readonly subscribers: Set<(updated: Record<string, LocalEntityWrapped>, removed: string[]) => void> = new Set();
  thisVocabularyChain: object;
  protected readonly baseIri: string;

  constructor(vocabulary: InMemorySemanticModel) {
    this.vocabulary = vocabulary;
    this.baseIri = vocabulary.getBaseIri();

    this.thisVocabularyChain = {
      name: this.vocabulary.getAlias() ?? "Vocabulary",
    };

    this.updateLocalEntities(this.vocabulary.getEntities(), []);
    this.vocabulary.subscribeToChanges((updated, removed) => {
      this.updateLocalEntities(updated, removed);
    });
  }

  /**
   * When entities from this model (profile) change this function is called.
   */
  private updateLocalEntities(updated: Record<string, Entity>, removed: string[]) {
    const toUpdate: Record<string, LocalEntityWrapped> = {};
    for (const entity of Object.values(updated)) {
      this.entities[entity.id] = {
        aggregatedEntity: withAbsoluteIri(entity as SemanticModelEntity, this.baseIri),
        vocabularyChain: [this.thisVocabularyChain],
        isReadOnly: true,
      };
      toUpdate[entity.id] = this.entities[entity.id];
    }

    for (const toRemove of removed) {
      delete this.entities[toRemove];
    }

    this.notifySubscribers(toUpdate, removed);
  }

  /**
   * Notifies all subscribers about the change that is already in entities.
   */
  private notifySubscribers(changed: typeof this.entities, removed: (keyof typeof this.entities)[]) {
    this.subscribers.forEach(subscriber => subscriber(changed, removed));
  }

  /**
   * Searches in the profile and all sources, if it is allowed.
   * For local search it provides two options:
   *  - use directly the entity
   *  - create a new profile of such entity
   * For external search it provides only one option:
   *  - create a new entity profile in this AP
   */
  async search(searchQuery: string): Promise<ExternalEntityWrapped[]> {
    const query = new RegExp(searchQuery, 'i');
    const results: ExternalEntityWrapped[] = [];

    const entities = Object.values(this.entities);
    const classes = entities.filter(entity => isSemanticModelClass(entity.aggregatedEntity)) as LocalEntityWrapped<SemanticModelClass>[];
    const localResults = classes.map(cls => ([cls, getSearchRelevance(query, cls.aggregatedEntity)]))
      .filter((([_, relevance]) => relevance !== false) as (result: [LocalEntityWrapped<SemanticModelClass>, number | false]) => result is [LocalEntityWrapped<SemanticModelClass>, number])
      .sort(([_, a], [__, b]) => a - b);

    for (const [cls] of localResults) {
      results.push({
        aggregatedEntity: cls.aggregatedEntity,
        vocabularyChain: [this.thisVocabularyChain],
        originatingModel: [this],
      });
    }

    return results;
  }

  async externalEntityToLocalForSearch(entity: ExternalEntityWrapped) {
    return this.entities[entity.aggregatedEntity.id];
  }

  execOperation(operation: any) {
    this.vocabulary.executeOperation(operation);
  }

  /**
   * We treat profiled entities as not part of this entity surroundings so we only return the direct entities.
   */
  async getSurroundings(localOrExternalEntityId: string): Promise<ExternalEntityWrapped[]> {
    return Object.values(this.entities).map(entity => ({
      aggregatedEntity: entity.aggregatedEntity,
      vocabularyChain: [this.thisVocabularyChain],
      originatingModel: [this],
    }));
  }

  /**
   * Get hierarchy should only work for local entities as there is no reason to get hierarchy of external entities as they should not be accessible.
   */
  getHierarchy(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    return this.getSurroundings(localEntityId);
  }

  /**
   * Shows full hierarchy of given local entity only for use with getSurroundings.
   */
  async getHierarchyForLookup(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    return this.getHierarchy(localEntityId);
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

  async externalEntityToLocalForHierarchyExtension(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelClass>, isEntityMoreGeneral: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    return this.entities[entity.aggregatedEntity.id];
  }

  async externalEntityToLocalForSurroundings(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelRelationship>, direction: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    return this.entities[entity.aggregatedEntity.id];
  }
}