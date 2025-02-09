import { Entity, EntityModel } from "@dataspecer/core-v2";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { HexColor, RepresentedEntityIdentifier, VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { ExternalSemanticModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship, isSemanticModelAttribute, isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelAttributeUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { UiAssociation, UiAssociationProfile, UiAttribute, UiAttributeProfile, UiClass, UiClassProfile, UiVocabulary, UiVocabularyType, UiGeneralization, UiModelState } from "./ui-model";
import { TranslationFunction, createLogger } from "../../application";
import { getDomainAndRange } from "../../util/relationship-utils";
import { MISSING_MODEL_IDENTIFIER } from "./ui-well-know";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { addToMapArray } from "../../utilities/functional";
import { createEmptyState } from "./ui-model-state";

const LOG = createLogger(import.meta.url);

/**
 * Create and return UiModel for given model.
 */
export function entityModelToUiModel(
  defaultModelColor: HexColor,
  t: TranslationFunction,
  model: EntityModel,
  visualModel: VisualModel | null,
): UiVocabulary {
  return {
    dsIdentifier: model.getId(),
    displayLabel: getModelLabel(t, model),
    vocabularyType: getModelType(model),
    displayColor: visualModel?.getModelColor(model.getId()) ?? defaultModelColor,
    baseIri: getModelBaseIri(model),
  }
}

function getModelLabel(t: TranslationFunction, model: EntityModel): string {
  const alias = model.getAlias();
  if (alias !== null) {
    return alias;
  }
  return t("model-service.model-label-from-id", model.getId());
}

function getModelType(model: EntityModel): UiVocabularyType {
  if (model instanceof InMemorySemanticModel) {
    return UiVocabularyType.InMemorySemanticModel;
  } else if (model instanceof ExternalSemanticModel) {
    return UiVocabularyType.ExternalSemanticModel;
  } else {
    return UiVocabularyType.Default;
  }
}

function getModelBaseIri(model: EntityModel): string | null {
  // We support anything with the "getBaseIri" method.
  if (typeof (model as any).getBaseIri === "function") {
    return (model as any).getBaseIri() as string;
  } else {
    return null;
  }
}

/**
 * Represent and return all entities from given models.
 *
 * Reference models are searched for referenced entities.
 *
 * Returned entities and models are sorted by the displayLabel.
 */
export function entityModelToUiState(
  defaultModelColor: string,
  t: TranslationFunction,
  models: EntityModel[],
  referenceModels: EntityModel[],
  aggregates: Record<string, AggregatedEntityWrapper>,
  visualModel: VisualModel | null,
  languages: string[],
): UiModelState {
  const state = createEmptyState();
  // We start by creating models.
  state.vocabularies = models.map(item => entityModelToUiModel(
    defaultModelColor, t, item, visualModel));
  // Add entities from all given models.
  for (const model of models) {
    addEntitiesToStateForModel(
      generateFromEntitiesAndAggregates(model.getEntities(), aggregates), append,
      referenceModels, visualModel, languages, state);
  }

  state.generalizations = updateGeneralizationLabels(state);

  sortState(state);

  return state;
}

function* generateFromEntitiesAndAggregates(
  entities: Record<string, Entity>,
  aggregates: Record<string, AggregatedEntityWrapper>,
) {
  for (const entity of Object.values(entities)) {
    const aggregate = aggregates[entity.id]?.aggregatedEntity ?? null;
    yield { entity, aggregate }
  }
}

function append<T extends { dsIdentifier: EntityDsIdentifier }>
(next: T, items: T[]): void {
  items.push(next);
}

/**
 * Expand given state by adding entities without generalizations.
 *
 * Generalizations are not added but added to a separate array.
 * The reason is that not all data to fully load them may be available.
 *
 * @param setter Used to set value to an array.
 */
function addEntitiesToStateForModel(
  entities: Generator<{ entity: Entity, aggregate: Entity | null }>,
  setter: <T extends {
    dsIdentifier: EntityDsIdentifier,
  }>(item: T, items: T[]) => void,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
  state: UiModelState,
): void {
  for (const { entity, aggregate } of entities) {
    // We start by searching for the owner.
    const owner = getOwnerModelIdentifier(referenceModels, entity.id);
    const model = state.vocabularies.find(item => item.dsIdentifier === owner);
    if (model === undefined) {
      LOG.warn("Ignoring update of entity without a model.", { entity: entity.id, model: owner });
      continue;
    }
    //
    if (isSemanticModelGeneralization(entity)) {
      const newGeneralization = semanticGeneralizationToUiGeneralization(
        entity, model, referenceModels, visualModel);
      setter(newGeneralization, state.generalizations);
    } else if (isSemanticModelClass(entity) && isSemanticModelClass(aggregate)) {
      // It is a class.
      const newClass = semanticClassToUiClass(
        entity, model, aggregate, visualModel, languages);
      setter(newClass, state.classes);
    } else if (isSemanticModelClassUsage(entity) && isSemanticModelClassUsage(aggregate)) {
      // It is a class profile
      const newProfile = semanticClassUsageToUiClassProfile(
        entity, model, aggregate, referenceModels, visualModel, languages);
      setter(newProfile, state.classProfiles);
    } else if (isSemanticModelAttribute(entity) && isSemanticModelAttribute(aggregate)) {
      // It is an attribute
      const newAttribute = semanticRelationshipToUiAttribute(
        entity, model, aggregate, referenceModels, visualModel, languages);
      setter(newAttribute, state.attributes);
    } else if (isSemanticModelRelationship(entity) && isSemanticModelRelationship(aggregate)) {
      // It is an association.
      const newAssociation = semanticRelationshipToUiAssociation(
        entity, model, aggregate, referenceModels, visualModel, languages);
      setter(newAssociation, state.associations);
    } else if (isSemanticModelRelationshipUsage(entity) && isSemanticModelAttributeUsage(aggregate)) {
      // It is an attribute profile.
      const newProfile = semanticRelationshipUsageToUiAttributeProfile(
        entity, model, aggregate, referenceModels, visualModel, languages);
      setter(newProfile, state.attributeProfiles)
    } else if (isSemanticModelRelationshipUsage(entity) && isSemanticModelRelationshipUsage(aggregate)) {
      // It is an association profile, attribute would end up in previous branch.
      const newProfile = semanticRelationshipUsageToUiAssociationProfile(
        entity, model, aggregate, referenceModels, visualModel, languages);
      setter(newProfile, state.associationProfiles);
    } else {
      LOG.invalidEntity(entity.id, "Can not determine type.", { entity, aggregate });
    }
  }
}

function getOwnerModelIdentifier(models: EntityModel[], entity: string | undefined | null): string {
  if (entity === undefined || entity === null) {
    return MISSING_MODEL_IDENTIFIER;
  }
  for (const model of models) {
    if (model.getEntities()[entity] === undefined) {
      continue;
    }
    return model.getId();
  }
  return MISSING_MODEL_IDENTIFIER;
}

/**
 * Assigned displayLabel are temporary.
 */
function semanticGeneralizationToUiGeneralization(
  entity: SemanticModelGeneralization,
  model: UiVocabulary,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
): UiGeneralization {
  return {
    dsIdentifier: entity.id,
    vocabulary: model,
    iri: entity.iri,
    // We use this as a placeholder to be set later.
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    parent: {
      entityDsIdentifier: entity.parent,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, entity.parent),
      displayLabel: entity.parent,
    },
    child: {
      entityDsIdentifier: entity.child,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, entity.child),
      displayLabel: entity.child,
    },
  }
}

function getVisualIdentifiers(visualModel: VisualModel | null, entity: { id: string }) {
  if (visualModel === null) {
    return null;
  }
  return visualModel.getVisualEntitiesForRepresented(entity.id)?.map(visualEntity => visualEntity.identifier) ?? null;
}

function semanticClassToUiClass(
  entity: SemanticModelClass,
  model: UiVocabulary,
  _aggregate: SemanticModelClass,
  visualModel: VisualModel | null,
  languages: string[],
): UiClass {
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: entity.iri ?? null,
    displayLabel: getLabel(languages, entity.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
  };
}

function getLabel(languages: string[], label: LanguageString | null | undefined): string {
  if (label === null || label === undefined) {
    return "";
  }
  const primary = label?.[languages[0]] ?? null;
  if (primary !== null) {
    return primary;
  }
  // We test for other languages, we also test the first one.
  for (const language of languages) {
    const value = label[language];
    if (value === undefined) {
      continue;
    }
    return `${value}@${language}`;
  }
  // Use no language.
  const emptyLanguageValue = label[""];
  if (emptyLanguageValue !== undefined) {
    return emptyLanguageValue;
  }
  // We have no preferred language, just use any value.
  for (const [language, value] of Object.entries(label)) {
    return `${value}@${language}`;
  }
  //
  return "";
}

function semanticClassUsageToUiClassProfile(
  entity: SemanticModelClassUsage,
  model: UiVocabulary,
  aggregate: SemanticModelClassUsage,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
): UiClassProfile {
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: aggregate.iri ?? null,
    displayLabel: getLabel(languages, aggregate.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    profiles: [{
      profileOf: {
        entityDsIdentifier: entity.usageOf,
        vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, entity.usageOf),
      }
    }],
  };
}

function semanticRelationshipToUiAttribute(
  entity: SemanticModelRelationship,
  model: UiVocabulary,
  _aggregate: SemanticModelRelationship,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
): UiAttribute {
  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    LOG.invalidEntity(entity.id, "Missing domain or range!");
  }
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: range?.iri ?? null,
    displayLabel: getLabel(languages, range?.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    domain: {
      entityDsIdentifier: domain?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, domain?.concept),
    },
    range: {
      dsIdentifier: range?.concept ?? MISSING_MODEL_IDENTIFIER,
    },
  };
}

function semanticRelationshipToUiAssociation(
  entity: SemanticModelRelationship,
  model: UiVocabulary,
  _aggregate: SemanticModelRelationship,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
): UiAssociation {
  const { domain, range } = getDomainAndRange(entity);
  if (domain === null || range === null) {
    LOG.invalidEntity(entity.id, "Missing domain or range!");
  }
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: range?.iri ?? null,
    displayLabel: getLabel(languages, range?.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    domain: {
      entityDsIdentifier: domain?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, domain?.concept),
    },
    range: {
      entityDsIdentifier: range?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, range?.concept),
    },
  };
}

function semanticRelationshipUsageToUiAttributeProfile(
  entity: SemanticModelRelationshipUsage,
  model: UiVocabulary,
  aggregate: SemanticModelRelationshipUsage,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
): UiAttributeProfile {
  const { domain, range } = getDomainAndRange(aggregate);
  if (domain === null || range === null) {
    LOG.invalidEntity(entity.id, "Missing domain or range!");
  }
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: range?.iri ?? null,
    displayLabel: getLabel(languages, range?.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    profiles: [{
      profileOf: {
        entityDsIdentifier: entity.usageOf,
        vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, entity.usageOf),
      }
    }],
    domain: {
      entityDsIdentifier: domain?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, domain?.concept),
    },
    range: {
      dsIdentifier: range?.concept ?? MISSING_MODEL_IDENTIFIER,
    },
  };
}

function semanticRelationshipUsageToUiAssociationProfile(
  entity: SemanticModelRelationshipUsage,
  model: UiVocabulary,
  aggregate: SemanticModelRelationshipUsage,
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
): UiAssociationProfile {
  const { domain, range } = getDomainAndRange(aggregate);
  if (domain === null || range === null) {
    LOG.invalidEntity(entity.id, "Missing domain or range!");
  }
  return {
    vocabulary: model,
    dsIdentifier: entity.id,
    iri: range?.iri ?? null,
    displayLabel: getLabel(languages, range?.name),
    visualDsIdentifiers: getVisualIdentifiers(visualModel, entity),
    profiles: [{
      profileOf: {
        entityDsIdentifier: entity.usageOf,
        vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, entity.usageOf),
      }
    }],
    domain: {
      entityDsIdentifier: domain?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, domain?.concept),
    },
    range: {
      entityDsIdentifier: range?.concept ?? MISSING_MODEL_IDENTIFIER,
      vocabularyDsIdentifier: getOwnerModelIdentifier(referenceModels, range?.concept),
    },
  };
}

/**
 * Take all generalizations from the state and update their labels.
 * Return new generalization array or the one from state if there was no change.
 */
function updateGeneralizationLabels(state: UiModelState): UiGeneralization[] {
  // We build map from entity to all relevant generalizations.
  const result: UiGeneralization[] = [...state.generalizations];
  const parents: Record<EntityDsIdentifier, number[]> = {};
  const children: Record<EntityDsIdentifier, number[]> = {};
  state.generalizations.forEach((item, index) => {
    addToMapArray(item.parent.entityDsIdentifier, index, parents);
    addToMapArray(item.child.entityDsIdentifier, index, children);
  });

  // Next we iterate all entities and update values when necessary.
  let changed = false;
  [state.classes, state.attributes, state.associations]
    .forEach(entities => entities.forEach(entity => {
      // Iterate over all items and update.
      for (const index of parents[entity.dsIdentifier] ?? []) {
        result[index] = {
          ...result[index],
          parent: {
            ...result[index].parent,
            displayLabel: entity.displayLabel,
          }
        };
        changed = true;
      }
      // Now the same but for children.
      for (const index of children[entity.dsIdentifier] ?? []) {
        result[index] = {
          ...result[index],
          child: {
            ...result[index].child,
            displayLabel: entity.displayLabel,
          }
        };
        changed = true;
      }
    }));
  if (changed) {
    return result;
  } else {
    return state.generalizations;
  }
}

function sortGeneralizationsByDisplayLabel(generalizations: UiGeneralization[]) {
  generalizations.sort((left, right) =>
    left.parent.displayLabel.localeCompare(right.parent.displayLabel) ||
    left.child.displayLabel.localeCompare(right.child.displayLabel)
  );
}

/**
 * Sort all entities in the state.
 */
function sortState(state: UiModelState) {
  sortEntitiesByDisplayLabel(state.vocabularies);
  sortEntitiesByDisplayLabel(state.classes);
  sortEntitiesByDisplayLabel(state.classProfiles);
  sortEntitiesByDisplayLabel(state.attributes);
  sortEntitiesByDisplayLabel(state.attributeProfiles);
  sortEntitiesByDisplayLabel(state.associations);
  sortEntitiesByDisplayLabel(state.associationProfiles);
  sortGeneralizationsByDisplayLabel(state.generalizations);
}

function sortEntitiesByDisplayLabel(entities: { displayLabel: string }[]): void {
  entities.sort((left, right) => left.displayLabel.localeCompare(right.displayLabel));
}

/**
 * Takes state and changes and produce a new updated state.
 *
 * Ignores remove requests on non-existing entities.
 */
export function semanticModelChangeToUiState(
  entities: AggregatedEntityWrapper[],
  removed: string[],
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
  state: UiModelState,
): UiModelState {
  // As the "addEntitiesToStateForModel" method can perform in-place array
  // modifications we re-create all arrays. This is sub-optimal and
  // creates optimization opportunity.
  const result: UiModelState = {
    ...state,
    vocabularies: [...state.vocabularies],
    classes: [...state.classes],
    classProfiles: [...state.classProfiles],
    attributes: [...state.attributes],
    attributeProfiles: [...state.attributeProfiles],
    associations: [...state.associations],
    associationProfiles: [...state.associationProfiles],
    generalizations: [...state.generalizations],
  };

  // Load updated entities.
  addEntitiesToStateForModel(
    generateFromAggregatedEntityWrappers(entities), replaceOrAdd,
    referenceModels, visualModel, languages, result);

  // As we do not know types of "remove", we just pass them like this.
  // We keep removal of generalizations at the end, as it is the most
  // expensive operation.
  result.classes = removeItems(result.classes, removed);
  result.classProfiles = removeItems(result.classProfiles, removed);
  result.attributes = removeItems(result.attributes, removed);
  result.attributeProfiles = removeItems(result.attributeProfiles, removed);
  result.associations = removeItems(result.associations, removed);
  result.associationProfiles = removeItems(result.associationProfiles, removed);
  result.generalizations = removeItems(result.generalizations, removed);

  result.generalizations = updateGeneralizationLabels(result);

  sortState(result);

  return result;
}

function* generateFromAggregatedEntityWrappers(
  entities: AggregatedEntityWrapper[],
) {
  for (const item of entities) {
    if (item.rawEntity === null) {
      LOG.error("Ignored update for null entity.", item);
      continue;
    }
    yield { entity: item.rawEntity, aggregate: item.aggregatedEntity }
  }
}

function replaceOrAdd<T extends { dsIdentifier: EntityDsIdentifier }>
(next: T, items: T[]): void {
  const index = items.findIndex(item => item.dsIdentifier === next.dsIdentifier);
  if (index === -1) {
    items.push(next);
  } else {
    items[index] = next;
  }
}

/**
 * Remove all items with identifiers in removed list.
 * Return filtered items or original array if there was no change.
 */
function removeItems<T extends { dsIdentifier: string }>(items: T[], toRemove: string[]): T[] {
  // Check to see if there is something to delete.
  if (toRemove.length === 0) {
    return items;
  }
  //
  return items.filter(item => toRemove.indexOf(item.dsIdentifier) === -1);
}

/**
 * Make sure that all visual information the state is from the given visual model.
 */
export function visualModelToUiState(
  state: UiModelState,
  visualModel: VisualModel,
  defaultColor: HexColor,
): UiModelState {
  const updatedVisual = updateUiStateVisual(state,
    (identifier) => visualModel.getModelColor(identifier) ?? defaultColor,
    (identifier) => visualModel.getVisualEntitiesForRepresented(identifier));
  return {
    ...updatedVisual,
    visualModel,
  };
}

/**
 * Update visual information the model, does not change the visual model.
 */
function updateUiStateVisual(
  state: UiModelState,
  getModelColor: (model: ModelDsIdentifier) => string,
  getVisualEntitiesForRepresented: (represented: RepresentedEntityIdentifier) => VisualEntity[] | null,
): UiModelState {
  // We start with updating the models.
  const models: Record<string, UiVocabulary> = {};
  const nextModels: UiVocabulary[] = [];
  for (const model of state.vocabularies) {
    const color = getModelColor(model.dsIdentifier);
    const nextModel = {
      ...model,
      displayColor: color,
    };
    nextModels.push(nextModel);
    models[model.dsIdentifier] = nextModel;
  }

  // Now we update entities.
  // We need to replace the UiModel and check for visualDsIdentifier.
  const updateEntity = <T extends {
    dsIdentifier: EntityDsIdentifier,
    vocabulary: UiVocabulary,
    visualDsIdentifiers: EntityDsIdentifier[] | null,
  }>(item: T): T => {
    const visuals = getVisualEntitiesForRepresented(item.dsIdentifier);
    return {
      ...item,
      vocabulary: models[item.vocabulary.dsIdentifier],
      visualDsIdentifiers: visuals?.map(visual => visual.identifier) ?? null,
    };
  };

  return {
    // We re-select the default model as color may have changed.
    defaultWriteVocabulary: nextModels.find(item => item.dsIdentifier === state.defaultWriteVocabulary?.dsIdentifier) ?? null,
    visualModel: state.visualModel,
    vocabularies: nextModels,
    classes: state.classes.map(updateEntity),
    classProfiles: state.classProfiles.map(updateEntity),
    attributes: state.attributes.map(updateEntity),
    attributeProfiles: state.attributeProfiles.map(updateEntity),
    associations: state.associations.map(updateEntity),
    associationProfiles: state.associationProfiles.map(updateEntity),
    generalizations: state.generalizations,
  };
}

/**
 * Remove all visual information from the state.
 */
export function removeVisualModelToUiState(
  state: UiModelState,
  defaultColor: HexColor,
): UiModelState {
  // We run the visualModelToUiState with an empty visual model.
  // Then we remove the visual model information.
  const updatedVisual = updateUiStateVisual(state,
    () => defaultColor,
    () => null);
  return {
    ...updatedVisual,
    visualModel: null,
  };
}
