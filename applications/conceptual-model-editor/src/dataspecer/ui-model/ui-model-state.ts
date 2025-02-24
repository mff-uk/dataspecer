import { EntityModel } from "@dataspecer/core-v2";
import { HexColor, isVisualNode, isVisualProfileRelationship, isVisualRelationship, VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { entityModelToUiModel, entityModelToUiState, removeVisualModelToUiState, semanticModelChangeToUiState, visualModelToUiState, } from "./aggregator-to-ui-model-adapter";
import { configuration, createLogger, t, TranslationFunction } from "../../application";
import { UiVocabulary, UiVocabularyType, UiModelState } from "./ui-model";
import { ModelIdentifier } from "../../../../../packages/core-v2/lib/visual-model/entity-model/entity-model";
import { addToRecordArray, replaceInArray } from "../../utilities/functional";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";

const LOG = createLogger(import.meta.url);

export function createEmptyState(): UiModelState {
  return {
    defaultWriteVocabulary: null,
    visualModel: null,
    vocabularies: [],
    classes: [],
    classProfiles: [],
    attributes: [],
    attributeProfiles: [],
    associations: [],
    associationProfiles: [],
    generalizations: [],
  };
}

/**
 * Create a new state with content of given semantic models and the visual model.
 */
export function createState(
  semanticModels: EntityModel[],
  visualModel: VisualModel | null,
  aggregatorView: SemanticModelAggregatorView,
  languages: string[],
): UiModelState {
  const entities = aggregatorView.getEntities();
  const state = entityModelToUiState(
    configuration().defaultModelColor, t,
    semanticModels, semanticModels,
    entities, visualModel, languages);
  return {
    ...state,
    defaultWriteVocabulary: selectWritableModel(state.vocabularies),
    visualModel,
  };
}

function selectWritableModel(models: UiVocabulary[]): UiVocabulary | null {
  return models.find(model => model.vocabularyType === UiVocabularyType.InMemorySemanticModel) ?? null;
}

/**
 * Handle change in array of semantic model, i.e. new model, removed model.
 * In addition check for changes in model properties.
 */
export function onChangeSemanticModels(
  defaultModelColor: HexColor,
  t: TranslationFunction,
  _languages: string[],
  previous: UiModelState,
  semanticModels: EntityModel[],
): UiModelState {
  const nextModels: UiVocabulary[] = [];
  for (const model of semanticModels) {
    const nextModel = entityModelToUiModel(defaultModelColor, t, model, previous.visualModel);
    const prevModel = previous.vocabularies.find(item => item.dsIdentifier === nextModel.dsIdentifier);
    if (prevModel === undefined) {
      // This is a new model.
      nextModels.push(nextModel);
    } else if (modelEqual(prevModel, nextModel)) {
      // They are the same, we keep the old.
      nextModels.push(prevModel);
    } else {
      // Model has changed.
      nextModels.push(nextModel);
    }
  }

  // We need to reselect the default model as it may be removed.
  let defaultWriteModel = nextModels
    .find(item => item.dsIdentifier === previous.defaultWriteVocabulary?.dsIdentifier)
    ?? null;
  if (defaultWriteModel === null) {
    defaultWriteModel = selectWritableModel(nextModels);
  }

  // Collect removed model.
  const removedModels = previous.vocabularies
    .filter(model => nextModels.find(item => item.dsIdentifier === model.dsIdentifier) === undefined)
    .map(model => model.dsIdentifier);

  if (removedModels.length === 0) {
    return {
      ...previous,
      defaultWriteVocabulary: defaultWriteModel,
      vocabularies: nextModels,
    };
  }

  // We need to filter the entities.
  return {
    defaultWriteVocabulary: defaultWriteModel,
    vocabularies: nextModels,
    visualModel: previous.visualModel,
    classes: removeWithVocabularies(previous.classes, removedModels),
    classProfiles: removeWithVocabularies(previous.classProfiles, removedModels),
    attributes: removeWithVocabularies(previous.attributes, removedModels),
    attributeProfiles: removeWithVocabularies(previous.attributeProfiles, removedModels),
    associations: removeWithVocabularies(previous.associations, removedModels),
    associationProfiles: removeWithVocabularies(previous.associationProfiles, removedModels),
    generalizations: removeWithVocabularies(previous.generalizations, removedModels),
  };
}

function modelEqual(left: UiVocabulary, right: UiVocabulary): boolean {
  return left.baseIri === right.baseIri &&
    left.displayColor === right.displayColor &&
    left.displayLabel === right.displayLabel &&
    left.dsIdentifier === right.dsIdentifier &&
    left.vocabularyType === right.vocabularyType;
}

function removeWithVocabularies<
  T extends { vocabulary: UiVocabulary }
>(items: T[], vocabularies: ModelDsIdentifier[]): T[] {
  return items.filter(item => !vocabularies.includes(item.vocabulary.dsIdentifier));
}

/**
 * Handle change of visual model, including removal by change to null.
 * Does not register for visual model listener.
 */
export function onChangeVisualModel(
  defaultModelColor: HexColor,
  visualModel: VisualModel | null,
  previous: UiModelState,
): UiModelState {
  if (visualModel === null) {
    return removeVisualModelToUiState(previous, defaultModelColor);
  } else {
    return visualModelToUiState(previous, visualModel, defaultModelColor);
  }
}

/**
 * Handle changes in semantic models' aggregator.
 */
export function onChangeInAggregatorView(
  semanticModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
  previous: UiModelState,
  updated: AggregatedEntityWrapper[],
  removed: string[],
): UiModelState {
  const state = semanticModelChangeToUiState(
    updated, removed, semanticModels, visualModel, languages, previous);
  return {
    ...state,
    defaultWriteVocabulary: selectWritableModel(state.vocabularies),
  };
}

/**
 * Handle changed of visual entities.
 */
export function onVisualEntitiesDidChange(
  entities: {
    previous: VisualEntity | null,
    next: VisualEntity | null
  }[],
  previous: UiModelState,
): UiModelState {
  const changes = collectVisualRepresentedChange(entities);
  return {
    ...previous,
    classes: updateVisual(previous.classes, changes),
    classProfiles: updateVisual(previous.classProfiles, changes),
    attributes: updateVisual(previous.attributes, changes),
    attributeProfiles: updateVisual(previous.attributeProfiles, changes),
    associations: updateVisual(previous.associations, changes),
    associationProfiles: updateVisual(previous.associationProfiles, changes),
    generalizations: updateVisual(previous.generalizations, changes),
  };
}

/**
 * @returns For a represented entity returns new values of visual entity.
 */
function collectVisualRepresentedChange(
  entities: {
    previous: VisualEntity | null,
    next: VisualEntity | null
  }[],
): Record<EntityDsIdentifier, EntityDsIdentifier[]> {
  const result: Record<EntityDsIdentifier, EntityDsIdentifier[]> = {};
  for (const change of entities) {
    if (change.previous !== null && change.next === null) {
      // Existing entity is removed.
      // We change the value to null, but only if is was not set
      // by other entity update.
      const represented = getRepresentedByVisual(change.previous);
      if (represented !== null) {
        removeFromMapValue(result, represented);
      }
      continue;
    }

    if (change.previous === null && change.next !== null) {
      // New entity is created.
      const represented = getRepresentedByVisual(change.next);
      if (represented !== null) {
        addToRecordArray(represented, change.next.identifier, result);
      }
      continue;
    }

    if (change.previous !== null && change.next !== null) {
      // There is a change in visual entity.
      const prev = getRepresentedByVisual(change.previous);
      const next = getRepresentedByVisual(change.next);
      if (prev === next) {
        // There is no relevant change.
        if(prev !== null) {
          addToRecordArray(prev, change.next.identifier, result);
          continue;
        }
      }
      //
      if (prev !== null) {
        // We need to remove the visual from the old entity,
        // unless set by other update.
        removeFromMapValue(result, prev);
      }
      if (next !== null) {
        // We add a new value.
        addToRecordArray(next, change.next.identifier, result);
      }
      continue;
    }
  }

  return result;
}

function removeFromMapValue<T>(map: Record<string, T[]>, key: string) {
  const existingValue = map[key];
  if(existingValue === undefined) {
    map[key] = [];
    return;
  }
}

function getRepresentedByVisual(visual: VisualEntity): EntityDsIdentifier | null {
  if (isVisualNode(visual)) {
    return visual.representedEntity;
  } else if (isVisualRelationship(visual)) {
    return visual.representedRelationship;
  } else if (isVisualProfileRelationship(visual)) {
    // While profile is bound to an entity it does not represent,
    // the entity. Thus we ignore it here.
    return null;
  } else {
    return null;
  }
}

/**
 * Apply changes od visualDsIdentifier to given items.
 */
function updateVisual<T extends {
  dsIdentifier: EntityDsIdentifier,
  visualDsIdentifiers: EntityDsIdentifier[] | null,
}>(items: T[], changes: Record<EntityDsIdentifier, EntityDsIdentifier[]>): T[] {
  return items.map(item => ({
    ...item,
    visualDsIdentifiers: changes[item.dsIdentifier],
  }));
}

/**
 * Handle change of semantic model color.
 */
export function onModelColorDidChange(
  defaultModelColor: HexColor,
  identifier: ModelIdentifier,
  next: HexColor | null,
  previous: UiModelState,
): UiModelState {
  const previousModel = previous.vocabularies.find(model => model.dsIdentifier === identifier);
  if (previousModel === undefined) {
    // No mode find.
    LOG.warn("Ignored color change for missing model.", { model: identifier })
    return previous;
  }
  const nextModel: UiVocabulary = {
    ...previousModel,
    displayColor: next ?? defaultModelColor,
  }

  // We may need to update defaultWriteModel.
  const defaultWriteModel = previous.defaultWriteVocabulary?.dsIdentifier === previousModel.dsIdentifier
    ? nextModel : previous.defaultWriteVocabulary;

  // Now we need to replace the model in all entities.
  return {
    defaultWriteVocabulary: defaultWriteModel,
    vocabularies: replaceInArray(previousModel, nextModel, previous.vocabularies),
    visualModel: previous.visualModel,
    classes: updateModelInEntities(previousModel, nextModel, previous.classes),
    classProfiles: updateModelInEntities(previousModel, nextModel, previous.classProfiles),
    attributes: updateModelInEntities(previousModel, nextModel, previous.attributes),
    attributeProfiles: updateModelInEntities(previousModel, nextModel, previous.attributeProfiles),
    associations: updateModelInEntities(previousModel, nextModel, previous.associations),
    associationProfiles: updateModelInEntities(previousModel, nextModel, previous.associationProfiles),
    generalizations: updateModelInEntities(previousModel, nextModel, previous.generalizations),
  };
}

function updateModelInEntities<T extends { vocabulary: UiVocabulary }>(
  previous: UiVocabulary,
  next: UiVocabulary,
  entities: T[],
): T[] {
  return entities.map(item => {
    if (item.vocabulary === previous) {
      return { ...item, vocabulary: next };
    } else {
      return item;
    }
  })
}
