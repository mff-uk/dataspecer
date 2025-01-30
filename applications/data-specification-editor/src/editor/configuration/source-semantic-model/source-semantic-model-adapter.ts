import { EntityModel } from "@dataspecer/core-v2";
import {
  SemanticModelClass,
  isSemanticModelClass,
  SemanticModelEntity,
  isSemanticModelRelationship,
  SemanticModelRelationship,
  isSemanticModelGeneralization,
  SemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { SourceSemanticModelInterface } from "../configuration";
import { SemanticModelAggregator, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

/**
 * Temporary implementation of the source semantic model.
 */
export class SourceSemanticModelFromEntityModels implements SourceSemanticModelInterface {
  aggregatorView: SemanticModelAggregatorView;
  allowedIds: string[] = [];

  /**
   * @param models - The models for which the source semantic model should be created.
   * @param supportingModels - List of all models that are used.
   */
  constructor(allowedModels: string[], supportingModels: EntityModel[]) {
    const aggregator = new SemanticModelAggregator();
    for (const model of supportingModels) {
      aggregator.addModel(model);
    }
    this.aggregatorView = aggregator.getView();
    for (const allowedModelId of allowedModels) {
      const model = supportingModels.find((model) => model.getId() === allowedModelId);
      this.allowedIds.push(...Object.keys(model.getEntities()));
    }
  }

  async search(searchQuery: string): Promise<SemanticModelClass[]> {
    const filteredEntities = [];

    const entities = this.aggregatorView.getEntities();
    for (const aggregatorEntity of Object.values(entities)) {
      const entity = aggregatorEntity.aggregatedEntity;
      if (!this.allowedIds.includes(aggregatorEntity.id)) {
        continue;
      }
      if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
        for (const name of Object.values(entity.name)) {
          if (name.toLowerCase().includes(searchQuery.toLowerCase())) {
            filteredEntities.push(entity);
          }
        }
      }
    }

    return filteredEntities;
  }

  /**
   * Returns surroudings of the entity with the given IRI.
   */
  async getSurroundings(): Promise<SemanticModelEntity[]> {
    const entities = Object.values(this.aggregatorView.getEntities())
      .filter((entity) => this.allowedIds.includes(entity.id))
      .map((entity) => entity.aggregatedEntity);
    return this.changeIdsOfEntitiesToIris(entities as SemanticModelEntity[]);
  }

  async getFullHierarchy(): Promise<SemanticModelEntity[]> {
    const entities = Object.values(this.aggregatorView.getEntities())
      .filter((entity) => this.allowedIds.includes(entity.id))
      .map((entity) => entity.aggregatedEntity);
    return this.changeIdsOfEntitiesToIris(entities as SemanticModelEntity[]);
  }

  /**
   * This is a trick to replace ids with iris so you can use local model as a source semantic model.
   */
  private changeIdsOfEntitiesToIris(entities: SemanticModelEntity[]): SemanticModelEntity[] {
    // Gather dictionary
    const dictionary = {};
    for (const entity of entities) {
      if (isSemanticModelClass(entity) && entity.iri) {
        dictionary[entity.id] = entity.iri;
      }
      if (isSemanticModelRelationship(entity) && entity.ends[1]?.iri) {
        dictionary[entity.id] = entity.ends[1]?.iri;
      }
    }

    // Translate everything
    const translation: SemanticModelEntity[] = [];
    for (const entity of entities) {
      if (isSemanticModelClass(entity)) {
        translation.push({ ...entity, id: dictionary[entity.id] ?? entity.id });
      }
      if (isSemanticModelRelationship(entity)) {
        translation.push({
          ...entity,
          id: dictionary[entity.id] ?? entity.id,
          ends: entity.ends.map((end) => ({ ...end, concept: dictionary[end.concept] ?? end.concept })),
        } as SemanticModelRelationship);
      }
      if (isSemanticModelGeneralization(entity)) {
        translation.push({
          ...entity,
          child: dictionary[entity.child] ?? entity.child,
          parent: dictionary[entity.parent] ?? entity.parent,
        } as SemanticModelGeneralization);
      }
    }

    return translation;
  }
}
