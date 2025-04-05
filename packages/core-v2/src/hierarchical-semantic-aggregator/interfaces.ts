import { SemanticModelClass, SemanticModelEntity, SemanticModelRelationship } from "../semantic-model/concepts";

/**
 * Wrapped entity that came from the search / adding surrounding entities.
 */
export type ExternalEntityWrapped<T extends SemanticModelEntity = SemanticModelEntity> = {
  aggregatedEntity: T;
  vocabularyChain: object[];

  /**
   * Chain of models the entity comes from.
   */
  originatingModel: object[];

  note?: string;
};

export type LocalEntityWrapped<T extends SemanticModelEntity = SemanticModelEntity> = {
  aggregatedEntity: T;
  vocabularyChain: object[];
  isReadOnly: boolean;
};

/**
 * Each structure schema has exactly one aggregator of this type.
 * The goal of this aggregator is to hide complex structure of connected models and provide simple API for the editor.
 */
export interface SemanticModelAggregator {
  search(searchQuery: string): Promise<ExternalEntityWrapped[]>;
  externalEntityToLocalForSearch(entity: ExternalEntityWrapped): Promise<LocalEntityWrapped>;

  /**
   * Returns the full hierarchy for entity that is local for this model.
   * Returned entities, however, can be from external models.
   * If the entity does not exist in the model, null is returned.
   */
  getHierarchy(localEntityId: string): Promise<ExternalEntityWrapped[] | null>;
  getHierarchyForLookup(localEntityId: string): Promise<ExternalEntityWrapped[] | null>;

  /**
   * Returns the surroundings for either local, or external entity.
   * The returned entities may be from local or external models.
   */
  getSurroundings(localOrExternalEntityId: string): Promise<ExternalEntityWrapped[]>;

  externalEntityToLocalForSurroundings(
    fromEntity: string,
    entity: ExternalEntityWrapped<SemanticModelRelationship>,
    direction: boolean,
    sourceSemanticModel: ExternalEntityWrapped[]
  ): Promise<LocalEntityWrapped>;
  externalEntityToLocalForHierarchyExtension(
    fromEntity: string,
    entity: ExternalEntityWrapped<SemanticModelClass>,
    isEntityMoreGeneral: boolean,
    sourceSemanticModel: ExternalEntityWrapped[]
  ): Promise<LocalEntityWrapped>;

  execOperation(operation: any): any;

  getAggregatedEntities(): Record<string, LocalEntityWrapped>;
  subscribeToChanges(callback: (updated: Record<string, LocalEntityWrapped>, removed: string[]) => void): void;

  getLocalEntity(id: string): LocalEntityWrapped | null;
}
