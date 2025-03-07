import { Entity } from "@dataspecer/core-v2";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationPrimitive, isSemanticModelRelationship, SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { CreatedEntityOperationResult } from "@dataspecer/core-v2/semantic-model/operations";
import { createDefaultProfileEntityAggregator, ProfileAggregator } from "@dataspecer/core-v2/semantic-model/profile/aggregator";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { createDefaultSemanticModelProfileOperationFactory, SemanticModelProfileOperationFactory } from "@dataspecer/core-v2/semantic-model/profile/operations";
import { ExternalEntityWrapped, SemanticModelAggregator, LocalEntityWrapped } from "./interfaces";
import { getSearchRelevance } from "./utils/get-search-relevance";
import { TupleSet } from "./utils/tuple-set";

function iriGetLastChunk(iri: string | null) {
  if (!iri) {
    return null;
  }

  const lastSlash = iri.lastIndexOf("/");
  const lastHash = iri.lastIndexOf("#");
  const last = Math.max(lastSlash, lastHash);
  return iri.substring(last + 1);
}

interface OriginatingModelMetadata {
  // todo still experimental
  action: "use as is" | "create profile from profile" | "create new profile";
  entity?: ExternalEntityWrapped;
}

function unwrap(originatingModelChain: object[]): [OriginatingModelMetadata, object[]] {
  const copy = [...originatingModelChain];
  return [copy.pop() as OriginatingModelMetadata, copy];
}

/**
 * This class aggregates single AP in the root that may profile multiple vocabularies.
 */
export class ApplicationProfileAggregator implements SemanticModelAggregator {
  /**
   * The profile that is being "wrapped" by this aggregator.
   */
  private readonly profile: InMemorySemanticModel;

  /**
   * Entities from this model ({@link profile}) easily accessible by id.
   */
  private readonly profileEntities: Record<string, Entity> = {};

  /**
   * The single source model that is being profiled.
   */
  private readonly source: SemanticModelAggregator;

  /**
   * All entities from the parent {@link source}.
   */
  private readonly sourceEntities: Record<string, LocalEntityWrapped> = {};

  /**
   * Aggregated entities by this model - the final result.
   */
  private readonly entities: Record<string, LocalEntityWrapped> = {};

  /**
   * Tuple X,Y: Entity X from this profile depends on entity Y from either this profile or the source model.
   */
  private readonly dependsOn: TupleSet<string, string> = new TupleSet();

  private readonly subscribers: Set<(updated: Record<string, LocalEntityWrapped>, removed: string[]) => void> = new Set();
  private readonly profileEntityAggregator: ProfileAggregator;
  private readonly operationFactory: SemanticModelProfileOperationFactory = createDefaultSemanticModelProfileOperationFactory();

  readonly thisVocabularyChain: object;

  /**
   * Whether new entities can be added either by profiling local entities or searching for external entities.
   */
  private canAddEntities: boolean = false;
  private canModify: boolean = false;

  constructor(profile: InMemorySemanticModel, source: SemanticModelAggregator, profileEntityAggregator?: ProfileAggregator) {
    this.profile = profile;
    this.source = source;
    this.profileEntityAggregator = profileEntityAggregator ?? createDefaultProfileEntityAggregator();

    this.updateSourceEntities(source.getAggregatedEntities());
    source.subscribeToChanges((updated, removed) => {
      this.updateSourceEntities(updated, removed);
    });

    this.updateLocalEntities(this.profile.getEntities(), []);
    this.profile.subscribeToChanges((updated, removed) => {
      this.updateLocalEntities(updated, removed);
    });

    this.thisVocabularyChain = {
      name: this.profile.getAlias() ?? "AP",
    };
  }

  setCanAddEntities(canAddEntities: boolean = true): this {
    this.canAddEntities = canAddEntities;
    return this;
  }

  setCanModify(canModify: boolean = true): this {
    this.canModify = canModify;
    return this;
  }

  /**
   * When entities from the source model change this function is called.
   */
  private updateSourceEntities(entities: Record<string, LocalEntityWrapped>, removed: string[] = []) {
    for (const entity of Object.values(entities)) {
      this.sourceEntities[entity.aggregatedEntity.id] = entity;
    }

    for (const toRemove of removed) {
      delete this.sourceEntities[toRemove];
    }

    const toNotify = new Set<string>();
    for (const changedEntity of [...Object.keys(entities), ...removed]) {
      for (const e of this.dependsOn.getBySecond(changedEntity)) {
        toNotify.add(e);
      }
    }

    // Based on entity dependencies we are notifying the following entities
    this.updateEntities([...toNotify]);
  }

  /**
   * When entities from this model (profile) change this function is called.
   */
  private updateLocalEntities(updated: Record<string, Entity>, removed: string[]) {
    for (const entity of Object.values(updated)) {
      this.profileEntities[entity.id] = entity;
    }

    for (const toRemove of removed) {
      delete this.profileEntities[toRemove];
    }

    // We are notifying only the given entities as we first need to process their change
    this.updateEntities([...Object.keys(updated), ...removed]);
  }

  /**
   * Called when there is a change in the source entities or profile entities.
   * @param toUpdate List of aggregated
   */
  private updateEntities(toUpdate: string[]) {
    const updated: Record<string, LocalEntityWrapped> = {};
    const removed: string[] = [];

    let entityId: string | undefined;
    // Newly discovered entities should be at the end to not cause infinite loop by accident
    while (entityId = toUpdate.pop()) {
      const entity = this.profileEntities[entityId];

      if (!entity) {
        // Entity is removed
        if (this.entities[entityId]) {
          removed.push(entityId);
          delete this.entities[entityId];
          this.dependsOn.deleteFirst(entityId);
          toUpdate.push(...this.dependsOn.getBySecond(entityId));
        }
      } else {
        if (isSemanticModelClassProfile(entity)) {
          const dependsOn = entity.profiling.map(id => this.entities[id]?.aggregatedEntity ?? this.sourceEntities[id]?.aggregatedEntity).filter(x => x) as SemanticModelClass[];
          const aggregatedEntity = this.profileEntityAggregator.aggregateSemanticModelClassProfile(entity, dependsOn);
          // todo workaround with typing
          const aggregatedEntityClass = {...aggregatedEntity, type: ["class", "class-profile"]} as unknown as SemanticModelClass;
          this.entities[entity.id] = {
            aggregatedEntity: aggregatedEntityClass,
            vocabularyChain: [],
            isReadOnly: true,
          }
          this.dependsOn.overrideByFirst(entity.id, entity.profiling);
          toUpdate.push(...this.dependsOn.getBySecond(entity.id));
          updated[entity.id] = this.entities[entity.id];
        } else if (isSemanticModelRelationshipProfile(entity)) {
          const dependsOn = entity.ends.map(end => end.profiling).flat().map(id => this.entities[id]?.aggregatedEntity ?? this.sourceEntities[id]?.aggregatedEntity).filter(x => x) as SemanticModelRelationship[];
          const aggregatedEntity = this.profileEntityAggregator.aggregateSemanticModelRelationshipProfile(entity, dependsOn);
          // todo workaround with typing
          const aggregatedEntityRelationship = {...aggregatedEntity, type: ["relationship", "relationship-profile"]} as unknown as SemanticModelRelationship;
          this.entities[entity.id] = {
            aggregatedEntity: aggregatedEntityRelationship,
            vocabularyChain: [],
            isReadOnly: true,
          }
          this.dependsOn.overrideByFirst(entity.id, entity.ends.map(end => end.profiling).flat());
          toUpdate.push(...this.dependsOn.getBySecond(entity.id));
          updated[entity.id] = this.entities[entity.id];
        } else if (isSemanticModelClass(entity)) {
          this.entities[entity.id] = {
            aggregatedEntity: entity,
            vocabularyChain: [],
            isReadOnly: true,
          };
          this.dependsOn.deleteFirst(entity.id); // class is independent
          toUpdate.push(...this.dependsOn.getBySecond(entity.id));
          updated[entity.id] = this.entities[entity.id];
        } else if (isSemanticModelRelationship(entity)) {
          this.entities[entity.id] = {
            aggregatedEntity: entity,
            vocabularyChain: [],
            isReadOnly: true,
          }
          this.dependsOn.deleteFirst(entity.id); // relationship is profile-independent
          toUpdate.push(...this.dependsOn.getBySecond(entity.id));
          updated[entity.id] = this.entities[entity.id];
        } else if (isSemanticModelGeneralization(entity)) {
          this.entities[entity.id] = {
            aggregatedEntity: entity,
            vocabularyChain: [],
            isReadOnly: true,
          }
          this.dependsOn.deleteFirst(entity.id); // generalization is profile-independent
          toUpdate.push(...this.dependsOn.getBySecond(entity.id));
          updated[entity.id] = this.entities[entity.id];
        }
      }
    }

    this.notifySubscribers(updated, removed);
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
        originatingModel: [{
          action: "use as is"
        } satisfies OriginatingModelMetadata],
        note: this.canAddEntities && this.canModify ? "use as is" : null
      });
      if (this.canAddEntities && this.canModify) {
        results.push({
          aggregatedEntity: cls.aggregatedEntity,
          vocabularyChain: [this.thisVocabularyChain],
          originatingModel: [{
            action: "create profile from profile"
          } satisfies OriginatingModelMetadata],
          note: "create profile from profile"
        });
      }
    }

    // Now search for external models
    if (this.canAddEntities && this.canModify) {
      const externalResults = await this.source.search(searchQuery);
      const resultsFlattened = externalResults.flat();

      for (const entity of resultsFlattened) {
        results.push({
          aggregatedEntity: entity.aggregatedEntity,
          vocabularyChain: [...entity.vocabularyChain, this.thisVocabularyChain],
          originatingModel: [...entity.originatingModel, {
            action: "create new profile",
            entity,
          } satisfies OriginatingModelMetadata],
          note: "create new profile"
        });
      }
    }

    return results;
  }

  /**
   * When specific entity from the search is selected, this function shall be called to convert it to the local entity.
   */
  async externalEntityToLocalForSearch(entity: ExternalEntityWrapped) {
    const [metadata] = unwrap(entity.originatingModel);

    if (metadata.action === "use as is") {
      return this.entities[entity.aggregatedEntity.id];
    }

    if (!(this.canAddEntities && this.canModify)) {
      throw new Error("Adding entities is not allowed to this application profile.");
    }

    let createProfileOf: string;
    if (metadata.action === "create new profile") {
      const sourceEntity = await this.source.externalEntityToLocalForSearch(metadata.entity);
      createProfileOf = sourceEntity.aggregatedEntity.id;
    } else if (metadata.action === "create profile from profile") {
      createProfileOf = entity.aggregatedEntity.id;
    } else {
      throw new Error("Unknown action");
    }

    return this.createClassProfile([createProfileOf]);
  }

  /**
   * As this is AP, you can only execute operations in this model.
   */
  execOperation(operation: any) {
    if (!this.canModify) {
      throw new Error("Modifying entities is not allowed to this application profile.");
    }
    this.profile.executeOperation(operation);
  }

  /**
   * We treat profiled entities as not part of this entity surroundings so we only return the direct entities.
   */
  async getSurroundings(localOrExternalEntityId: string): Promise<ExternalEntityWrapped[]> {
    if (this.entities[localOrExternalEntityId]) {
      // This is local entity, process it here

      const collectedEntities = new Set<LocalEntityWrapped>();
      for (const entity of Object.values(this.entities)) {
        if (isSemanticModelRelationship(entity.aggregatedEntity)) {
          for (const end of entity.aggregatedEntity.ends) {
            if (end.concept === localOrExternalEntityId) {
              collectedEntities.add(entity);
              entity.aggregatedEntity.ends.forEach(end => this.entities[end.concept] ? collectedEntities.add(this.entities[end.concept]) : null);
            }
          }
        }
      }

      return [...collectedEntities].map(entity => ({
        aggregatedEntity: entity.aggregatedEntity,
        vocabularyChain: [this.thisVocabularyChain],
        originatingModel: [this],
      }));
    } else {
      // This is an external entity, process it in the source
      if (this.canModify && this.canAddEntities) {
        const surroundings = this.source.getSurroundings(localOrExternalEntityId);
        return surroundings;
      } else {
        return [];
      }
    }
  }

  /**
   * Get hierarchy should only work for local entities as there is no reason to get hierarchy of external entities as they should not be accessible.
   */
  async getHierarchy(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {
    if (!this.entities[localEntityId]) {
      return null;
    }
  }

  /**
   * Shows full hierarchy of given local entity only for use with getSurroundings.
   */
  async getHierarchyForLookup(localEntityId: string): Promise<ExternalEntityWrapped[] | null> {

    if (!this.entities[localEntityId]) {
      return null;
    }

    const fullCompleteHierarchy: Record<string, ExternalEntityWrapped> = {};
    const classProfiles = Object.values(this.entities).filter(entity => isSemanticModelClass(entity.aggregatedEntity)) as LocalEntityWrapped<SemanticModelClassProfile>[];

    const subProfiles: LocalEntityWrapped[] = [this.entities[localEntityId] as LocalEntityWrapped];
    {
      const lookup: LocalEntityWrapped<SemanticModelClassProfile>[] = [this.entities[localEntityId] as LocalEntityWrapped<SemanticModelClassProfile>];
      let subProfile: LocalEntityWrapped<SemanticModelClassProfile>;
      while (subProfile = lookup.pop()) {
        for (const profile of classProfiles) {
          if (profile.aggregatedEntity.profiling.includes(subProfile.aggregatedEntity.id)) {
            if (!subProfiles.includes(profile)) {
              lookup.push(profile);
              subProfiles.push(profile);
              subProfiles.push(this.getFakeGeneralization(profile.aggregatedEntity.id, subProfile.aggregatedEntity.id));
            }
          }
        }
      }
    }
    subProfiles.map(entity => fullCompleteHierarchy[entity.aggregatedEntity.id] = ({
      aggregatedEntity: entity.aggregatedEntity,
      vocabularyChain: [this.thisVocabularyChain],
      originatingModel: [this],
    }));

    const superProfiles: LocalEntityWrapped[] = [this.entities[localEntityId]];
    {
      const lookup: LocalEntityWrapped<SemanticModelClassProfile>[] = [this.entities[localEntityId] as LocalEntityWrapped<SemanticModelClassProfile>];
      let superProfile: LocalEntityWrapped<SemanticModelClassProfile>;
      while (superProfile = lookup.pop()) {
        for (const profile of classProfiles) {
          if (superProfile.aggregatedEntity.profiling.includes(profile.aggregatedEntity.id)) {
            if (!superProfiles.includes(profile)) {
              lookup.push(profile);
              superProfiles.push(profile);
              superProfiles.push(this.getFakeGeneralization(superProfile.aggregatedEntity.id, profile.aggregatedEntity.id));
            }
          }
        }
      }
    }
    superProfiles.map(entity => fullCompleteHierarchy[entity.aggregatedEntity.id] = ({
      aggregatedEntity: entity.aggregatedEntity,
      vocabularyChain: [this.thisVocabularyChain],
      originatingModel: [this],
    }));

    // Now we need hierarchy for each class profile.
    if (this.canAddEntities && this.canModify) {
      for (const superProfile of superProfiles) {
        if (!isSemanticModelClass(superProfile.aggregatedEntity) && !isSemanticModelClassProfile(superProfile.aggregatedEntity)) {
          continue;
        }
        for (const id of (superProfile.aggregatedEntity as SemanticModelClassProfile).profiling) {
          if (this.entities[id]) {
            // We are interested in external entities only
            continue;
          }
          const hierarchy = await this.source.getHierarchyForLookup(id);
          if (!hierarchy) {
            continue;
          }
          hierarchy.map(entity => fullCompleteHierarchy[entity.aggregatedEntity.id] = entity);
          // todo typings
          // @ts-ignore
          hierarchy.filter(entity => isSemanticModelClass(entity.aggregatedEntity)).forEach(entity => entity.viaExternalEntity = id);

          const generalization = this.getFakeGeneralization(superProfile.aggregatedEntity.id, id);
          fullCompleteHierarchy[generalization.aggregatedEntity.id] = {
            aggregatedEntity: generalization.aggregatedEntity,
            vocabularyChain: [this.thisVocabularyChain],
            originatingModel: [this],
          };
        }
      }
    }

    return Object.values(fullCompleteHierarchy);
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

  /**
   * Mainly for subseting the entities
   */
  async externalEntityToLocalForHierarchyExtension(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelClass>, isEntityMoreGeneral: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    if (entity.aggregatedEntity.id in this.entities) {
      // Already as the profile
      // No need to extend in any way
      return this.entities[entity.aggregatedEntity.id];
    }

    if (!(this.canAddEntities && this.canModify)) {
      throw new Error("Adding entities is not allowed to this application profile.");
    }

    const localFromEntity = this.entities[fromEntity] as LocalEntityWrapped<SemanticModelClass & SemanticModelClassProfile>;

    // Get the from entity from the source model
    const fromEntityFromSource = localFromEntity.aggregatedEntity.profiling[0]; // todo

    // Get the entity from the source model
    const entityFromSource = await this.source.externalEntityToLocalForHierarchyExtension(fromEntityFromSource, entity, isEntityMoreGeneral, sourceSemanticModel) as LocalEntityWrapped<SemanticModelClass & SemanticModelClassProfile>;

    // Create the profile
    return this.createClassProfile([entityFromSource.aggregatedEntity.id]);
  }

  async externalEntityToLocalForSurroundings(fromEntity: string, entity: ExternalEntityWrapped<SemanticModelRelationship>, direction: boolean, sourceSemanticModel: ExternalEntityWrapped[]): Promise<LocalEntityWrapped> {
    if (this.entities[entity.aggregatedEntity.id]) {
      // The relation is already in the model, use the existing one
      return this.entities[entity.aggregatedEntity.id];
    }

    if (!(this.canAddEntities && this.canModify)) {
      throw new Error("Adding entities is not allowed to this application profile.");
    }

    const startEndId = entity.aggregatedEntity.ends[direction ? 0 : 1].concept;
    // @ts-ignore - we need to find correct entity with external entity info
    const startEnd = sourceSemanticModel.find(e => e.aggregatedEntity.id === startEndId && e.viaExternalEntity) as ExternalEntityWrapped<SemanticModelClass>;
    // @ts-ignore
    const viaExternalEntity = startEnd.viaExternalEntity;


    // Get local relation from the source model
    const sourceEntity = await this.source.externalEntityToLocalForSurroundings(viaExternalEntity, entity, direction, sourceSemanticModel) as LocalEntityWrapped<SemanticModelRelationship>;

    // Create profile for the class if it is really a class

    const isAttribute = isSemanticModelRelationPrimitive(entity.aggregatedEntity);
    const conceptId = sourceEntity.aggregatedEntity.ends[direction ? 1 : 0].concept;
    const classProfileId = isAttribute ? conceptId : this.createClassProfile([conceptId]).aggregatedEntity.id;

    // Create the relationship
    return this.createRelationshipProfile(fromEntity, classProfileId, [sourceEntity.aggregatedEntity.id]);
  }

  private createRelationshipProfile(firstEnd: string, secondEnd: string, profiling: string[]) {
    const firstProfiled = profiling[0];
    // @ts-ignore bad typing
    const firstProfiledEntity = this.sourceEntities[firstProfiled] as LocalEntityWrapped<SemanticModelRelationship | SemanticModelRelationshipProfile>;

    const operation = this.operationFactory.createRelationshipProfile({
      ends: [
        {
          iri: iriGetLastChunk(firstProfiledEntity.aggregatedEntity.ends[0].iri),
          name: null,
          nameFromProfiled: firstProfiled,
          description: null,
          descriptionFromProfiled: firstProfiled,
          usageNote: null,
          usageNoteFromProfiled: isSemanticModelRelationshipProfile(firstProfiledEntity.aggregatedEntity) ? firstProfiled : null,
          concept: firstEnd,
          cardinality: firstProfiledEntity.aggregatedEntity.ends[0].cardinality, // todo intersection
          profiling: [],
        },
        {
          iri: iriGetLastChunk(firstProfiledEntity.aggregatedEntity.ends[1].iri),
          name: null,
          nameFromProfiled: firstProfiled,
          description: null,
          descriptionFromProfiled: firstProfiled,
          usageNote: null,
          usageNoteFromProfiled: isSemanticModelRelationshipProfile(firstProfiledEntity.aggregatedEntity) ? firstProfiled : null,
          concept: secondEnd,
          cardinality: firstProfiledEntity.aggregatedEntity.ends[1].cardinality, // todo intersection
          profiling,
        }
      ]
    });
    const { id } = this.profile.executeOperation(operation) as CreatedEntityOperationResult;

    return this.entities[id] as LocalEntityWrapped<SemanticModelRelationship>;
  }

  private createClassProfile(profiling: string[]): LocalEntityWrapped<SemanticModelClassProfile & SemanticModelClass> {
    const firstProfiled = profiling[0];
    const firstProfiledEntity = (this.sourceEntities[firstProfiled] ?? this.entities[firstProfiled]) as LocalEntityWrapped<SemanticModelClass | SemanticModelClassProfile>;

    const operation = this.operationFactory.createClassProfile({
      iri: iriGetLastChunk(firstProfiledEntity.aggregatedEntity.iri),
      name: null,
      nameFromProfiled: firstProfiled,
      description: null,
      descriptionFromProfiled: firstProfiled,
      usageNote: null,
      usageNoteFromProfiled: isSemanticModelClassProfile(firstProfiledEntity.aggregatedEntity) ? firstProfiled : null,
      profiling,
    });
    const { id } = this.profile.executeOperation(operation) as CreatedEntityOperationResult;

    return this.entities[id] as LocalEntityWrapped<SemanticModelClassProfile & SemanticModelClass>;
  }

  private getFakeGeneralization(child: string, parent: string): LocalEntityWrapped<SemanticModelGeneralization> {
    const generalization = {
      type: ["generalization"],
      iri: null,
      id: `https://dataspecer.com/aggregator/profile-to-generalization?child=${encodeURIComponent(child)}&parent=${encodeURIComponent(parent)}`,
      child,
      parent,
    } as SemanticModelGeneralization;

    return {
      aggregatedEntity: generalization,
      vocabularyChain: [this.thisVocabularyChain],
      isReadOnly: true,
    };
  }
}