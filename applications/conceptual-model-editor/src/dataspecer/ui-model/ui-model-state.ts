import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import { UI_UNKNOWN_ENTITY_TYPE, UiClass, UiClassProfile, UiEntity, UiGeneralization, UiRelationship, UiRelationshipProfile, UiSemanticModel } from "./model";
import { cmeClassAggregateToUiClassProfile, cmeClassToUiClass, cmeGeneralizationToCmeGeneralization, cmeRelationshipAggregateToUiRelationshipProfile, cmeRelationshipToUiRelationship, cmeSemanticModelToUiSemanticModel } from "./adapter";
import { HexColor, VisualModel } from "@dataspecer/core-v2/visual-model";
import { SemanticModel } from "../semantic-model";
import { createLogger } from "../../application";
import { createUiAdapterContext, UiAdapterContext } from "./adapter/adapter-context";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";
import { semanticClassToCmeClass, semanticGeneralizationToCmeGeneralization, semanticRelationshipToCmeRelationship } from "../cme-model/adapter";
import { semanticClassProfileToCmeClassAggregate } from "../cme-model/adapter/cme-class-profile-aggregate";
import { semanticRelationshipProfileToCmeRelationshipAggregate } from "../cme-model/adapter/cme-relationship-aggregate-adapter";
import { UnknownCmeEntity, UnknownCmeSemanticModel, UnspecifiedCmeEntity, semanticModelToCmeSemanticModel } from "../cme-model";
import { languageStringToString } from "../../utilities/string";
import { EntityDsIdentifier } from "../entity-model";
import { Entity } from "@dataspecer/core-v2";

const LOG = createLogger(import.meta.url);

export interface UiModelState {

  /**
   * Represent an undefined or missing semantic model.
   */
  unknownSemanticModel: UiSemanticModel;

  unknownUiEntity: UiEntity;

  unspecifiedUiEntity: UiEntity;

  semanticModels: UiSemanticModel[];

  classes: UiClass[];

  classProfiles: UiClassProfile[];

  relationships: UiRelationship[];

  relationshipProfiles: UiRelationshipProfile[];

  generalizations: UiGeneralization[];

  /**
   * Here we store unknown entities.
   * Those are entities referenced from other entities but not found.
   */
  unknown: UiEntity[];

}

export function createEmptyUiModelState(
  language: string,
  languagePreferences: string[],
  defaultModelColor: HexColor,
): UiModelState {
  const unknownSemanticModel: UiSemanticModel = {
    identifier: UnknownCmeSemanticModel.identifier,
    modelType: UnknownCmeSemanticModel.modelType,
    label: languageStringToString(
      languagePreferences, language, UnknownCmeSemanticModel.name),
    color: defaultModelColor,
  };
  Object.freeze(unknownSemanticModel);
  const unknownUiEntity: UiEntity = {
    identifier: UnknownCmeEntity.identifier,
    label: languageStringToString(
      languagePreferences, language, UnknownCmeEntity.name),
    model: unknownSemanticModel,
    type: UI_UNKNOWN_ENTITY_TYPE,
  };
  Object.freeze(unknownUiEntity);
  const unspecifiedUiEntity: UiEntity = {
    identifier: UnspecifiedCmeEntity.identifier,
    label: languageStringToString(
      languagePreferences, language, UnspecifiedCmeEntity.name),
    model: unknownSemanticModel,
    type: UI_UNKNOWN_ENTITY_TYPE,
  };
  Object.freeze(unspecifiedUiEntity);
  return {
    unknownSemanticModel,
    unknownUiEntity,
    unspecifiedUiEntity,
    semanticModels: [],
    classes: [],
    classProfiles: [],
    relationships: [],
    relationshipProfiles: [],
    generalizations: [],
    unknown: [],
  };
}

/**
 * Create ui-model state using cme-model from semantic model.
 */
export function createUiModelState(
  aggregatorView: SemanticModelAggregatorView,
  semanticModels: SemanticModel[],
  language: string,
  languagePreferences: string[],
  visualModel: VisualModel | null,
  defaultModelColor: HexColor,
): UiModelState {
  const state = createEmptyUiModelState(
    language, languagePreferences, defaultModelColor);

  // Prepare context.
  const context = createUiAdapterContext(
    language, languagePreferences, visualModel,
    defaultModelColor, semanticModels);

  loadUiSemanticModels(
    visualModel, defaultModelColor, context, semanticModels, state);

  // Problem with loading entities are dependencies.
  // Luckily we can load them in order of class, relationship and generalization.
  // Then when loading one the required should be already loaded.
  const entityMap: Map<EntityDsIdentifier, UiEntity> = new Map();
  const aggregatorEntities = aggregatorView.getEntities();

  loadUiClassesAndProfiles(
    context, semanticModels, aggregatorEntities, state);
  updateEntityMap(entityMap, state.classes);
  updateEntityMap(entityMap, state.classProfiles);

  loadUiRelationshipAndProfiles(
    context, semanticModels, aggregatorEntities, entityMap, state);
  updateEntityMap(entityMap, state.relationships);
  updateEntityMap(entityMap, state.relationshipProfiles);

  loadUiGeneralizations(
    context, semanticModels, aggregatorEntities, entityMap, state);
  return state;
}

function loadUiSemanticModels(
  visualModel: VisualModel | null,
  defaultModelColor: HexColor,
  context: UiAdapterContext,
  semanticModels: SemanticModel[],
  state: UiModelState,
): void {
  state.semanticModels = semanticModels
    .map(model => semanticModelToCmeSemanticModel(
      model, visualModel, defaultModelColor, id => id))
    .map(model => cmeSemanticModelToUiSemanticModel(context, model));
}

function loadUiClassesAndProfiles(
  context: UiAdapterContext,
  semanticModels: SemanticModel[],
  aggregatorEntities: Record<string, AggregatedEntityWrapper>,
  state: UiModelState,
): void {
  withEntities(semanticModels, state, aggregatorEntities,
    item => isSemanticModelClass(item) || isSemanticModelClassProfile(item),
    (model, raw, aggregate) => {
      if (isSemanticModelClass(aggregate)) {
        const cme = semanticClassToCmeClass(model.identifier, aggregate);
        state.classes.push(cmeClassToUiClass(context, model, cme));
      }
      if (isSemanticModelClassProfile(raw)
        && isSemanticModelClassProfile(aggregate)) {
        const cme = semanticClassProfileToCmeClassAggregate(
          model.identifier, raw, aggregate);
        state.classProfiles.push(cmeClassAggregateToUiClassProfile(
          context, model, cme));
      }
    });
}

/**
 * Find entities that pass {@link filter} and call {@link accept} on them.
 */
function withEntities<Type extends Entity>(
  semanticModels: SemanticModel[],
  state: UiModelState,
  aggregatorEntities: Record<string, AggregatedEntityWrapper>,
  filter: (entity: Entity) => entity is Type,
  accept: (semanticModel: UiSemanticModel, raw: Type, aggregate: Type) => void,
): void {
  for (const model of semanticModels) {
    const uiSemanticModel = secureUiSemanticModel(state, model);
    for (const entityIdentifier of Object.keys(model.getEntities())) {
      const wrap = aggregatorEntities[entityIdentifier];
      const raw = wrap.rawEntity;
      const aggregate = wrap.aggregatedEntity;
      if (raw === null || aggregate === null) {
        // This should not happen, if it does it will produce a lot of
        // messages as this function is called multiple times.
        LOG.invalidEntity(entityIdentifier,
          "Raw entity or aggregate are null.",
          { raw, aggregate });
        continue;
      }
      if (filter(raw) && filter(aggregate)) {
        accept(uiSemanticModel, raw, aggregate);
      }
    }
  }
}

function secureUiSemanticModel(
  state: UiModelState,
  semanticModel: SemanticModel,
): UiSemanticModel {
  const identifier = semanticModel.getId();
  const uiSemanticModel = state.semanticModels
    .find(item => item.identifier === identifier);
  if (uiSemanticModel === undefined) {
    // This should not happen as all models should be part of the state.
    LOG.error("Missing semantic model.", { state, identifier });
    return state.unknownSemanticModel;
  }
  return uiSemanticModel;
}

function updateEntityMap(
  entityMap: Map<EntityDsIdentifier, UiEntity>, entities: UiEntity[],
): void {
  entities.forEach(item => entityMap.set(item.identifier, item));
}

function loadUiRelationshipAndProfiles(
  context: UiAdapterContext,
  semanticModels: SemanticModel[],
  aggregatorEntities: Record<string, AggregatedEntityWrapper>,
  entityMap: Map<EntityDsIdentifier, UiEntity>,
  state: UiModelState,
): void {

  const findEntity = (identifier: EntityDsIdentifier | null): UiEntity => {
    if (identifier === null) {
      return state.unspecifiedUiEntity;
    }
    const entity = entityMap.get(identifier);
    if (entity === undefined) {
      // We have identifier but no entity, we create a representant
      const result: UiEntity = { ...state.unknownUiEntity, identifier };
      state.unknown.push(result);
      return result;
    }
    return entity;
  };

  withEntities(semanticModels, state, aggregatorEntities,
    item => isSemanticModelRelationship(item) || isSemanticModelRelationshipProfile(item),
    (model, raw, aggregate) => {
      if (isSemanticModelRelationship(aggregate)) {
        const cme = semanticRelationshipToCmeRelationship(
          model.identifier, aggregate);
        state.relationships.push(cmeRelationshipToUiRelationship(
          context, model, cme, findEntity(cme.range), findEntity(cme.domain)));
      }
      if (isSemanticModelRelationshipProfile(raw)
        && isSemanticModelRelationshipProfile(aggregate)) {
        const cme = semanticRelationshipProfileToCmeRelationshipAggregate(
          model.identifier, raw, aggregate);
        state.relationshipProfiles.push(
          cmeRelationshipAggregateToUiRelationshipProfile(
            context, model, cme, findEntity(cme.range), findEntity(cme.domain)));
      }
    });
}

function loadUiGeneralizations(
  context: UiAdapterContext,
  semanticModels: SemanticModel[],
  aggregatorEntities: Record<string, AggregatedEntityWrapper>,
  entityMap: Map<EntityDsIdentifier, UiEntity>,
  state: UiModelState,
): void {

  const findEntity = (identifier: EntityDsIdentifier): UiEntity => {
    const entity = entityMap.get(identifier);
    if (entity === undefined) {
      // We have identifier but no entity, we create a representant
      const result: UiEntity = { ...state.unknownUiEntity, identifier };
      state.unknown.push(result);
      return result;
    }
    return entity;
  };

  withEntities(semanticModels, state, aggregatorEntities,
    item => isSemanticModelGeneralization(item),
    (model, raw, aggregate) => {
      const cme = semanticGeneralizationToCmeGeneralization(
        model.identifier, aggregate);
      state.generalizations.push(cmeGeneralizationToCmeGeneralization(
        model, cme,
        findEntity(cme.parentIdentifier), findEntity(cme.childIdentifier)));
    });
}