import { EntityModel } from "@dataspecer/core-v2";
import { HexColor, isVisualNode, isVisualProfileRelationship, isVisualRelationship, VisualEntity, VisualModel } from "@dataspecer/core-v2/visual-model";
import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { entityModelToUiModel, entityModelToUiState, removeVisualModelToUiState, semanticModelChangeToUiState, visualModelToUiState, } from "./aggregator-to-ui-model-adapter";
import { configuration, createLogger, t, TranslationFunction } from "../../application";
import { UiModel, UiModelType, UiModelState } from "./ui-model";
import { ModelIdentifier } from "../../../../../packages/core-v2/lib/visual-model/entity-model/entity-model";
import { replaceInArray } from "../../utilities/functional";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";

const LOG = createLogger(import.meta.url);

export function createEmptyState(): UiModelState {
  return {
    defaultWriteModel: null,
    visualModel: null,
    models: [],
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
    defaultWriteModel: selectWritableModel(state.models),
    visualModel,
  };
}

function selectWritableModel(models: UiModel[]): UiModel | null {
  return models.find(model => model.modelType === UiModelType.InMemorySemanticModel) ?? null;
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
  const nextModels: UiModel[] = [];
  for (const model of semanticModels) {
    const nextModel = entityModelToUiModel(defaultModelColor, t, model, previous.visualModel);
    const prevModel = previous.models.find(item => item.dsIdentifier === nextModel.dsIdentifier);
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
    .find(item => item.dsIdentifier === previous.defaultWriteModel?.dsIdentifier)
    ?? null;
  if (defaultWriteModel === null) {
    defaultWriteModel = selectWritableModel(nextModels);
  }

  // Collect removed model.
  const removedModels = previous.models
    .filter(model => nextModels.find(item => item.dsIdentifier === model.dsIdentifier) === undefined)
    .map(model => model.dsIdentifier);

  if (removedModels.length === 0) {
    return {
      ...previous,
      defaultWriteModel,
      models: nextModels,
    };
  }

  // We need to filter the entities.
  return {
    defaultWriteModel,
    models: nextModels,
    visualModel: previous.visualModel,
    classes: removeWithModels(previous.classes, removedModels),
    classProfiles: removeWithModels(previous.classProfiles, removedModels),
    attributes: removeWithModels(previous.attributes, removedModels),
    attributeProfiles: removeWithModels(previous.attributeProfiles, removedModels),
    associations: removeWithModels(previous.associations, removedModels),
    associationProfiles: removeWithModels(previous.associationProfiles, removedModels),
    generalizations: removeWithModels(previous.generalizations, removedModels),
  };
}

function modelEqual(left: UiModel, right: UiModel): boolean {
  return left.baseIri === right.baseIri &&
    left.displayColor === right.displayColor &&
    left.displayLabel === right.displayLabel &&
    left.dsIdentifier === right.dsIdentifier &&
    left.modelType === right.modelType;
}

function removeWithModels<T extends { model: UiModel }>(items: T[], models: ModelDsIdentifier[]): T[] {
  return items.filter(item => !models.includes(item.model.dsIdentifier));
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
    defaultWriteModel: selectWritableModel(state.models),
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
): Record<EntityDsIdentifier, EntityDsIdentifier | null> {
  const result: Record<EntityDsIdentifier, EntityDsIdentifier | null> = {};
  for (const change of entities) {

    if (change.previous !== null && change.next === null) {
      // Existing entity is removed.
      // We change the value to null, but only if is was not set
      // by other entity update.
      const represented = getRepresentedByVisual(change.previous);
      if (represented !== null) {
        result[represented] = result[change.previous.identifier] ?? null;
      }
      continue;
    }

    if (change.previous === null && change.next !== null) {
      // New entity is created.
      const represented = getRepresentedByVisual(change.next);
      if (represented !== null) {
        result[represented] = change.next.identifier;
      }
      continue;
    }

    if (change.previous !== null && change.next !== null) {
      // There is a change in visual entity.
      const prev = getRepresentedByVisual(change.previous);
      const next = getRepresentedByVisual(change.previous);
      if (prev === next) {
        // There is no relevant change.
        continue;
      }
      //
      if (prev !== null) {
        // We need to remove the visual from the old entity,
        // unless set by other update.
        result[prev] = result[prev] ?? null;
      }
      if (next !== null) {
        // We add a new value.
        result[next] = change.next.identifier;
      }
      continue;
    }
  }
  return result;
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
  visualDsIdentifier: EntityDsIdentifier | null,
}>(items: T[], changes: Record<EntityDsIdentifier, EntityDsIdentifier | null>): T[] {
  return items.map(item => ({
    ...item,
    visualDsIdentifier: changes[item.dsIdentifier],
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
  const previousModel = previous.models.find(model => model.dsIdentifier === identifier);
  if (previousModel === undefined) {
    // No mode find.
    LOG.warn("Ignored color change for missing model.", { model: identifier })
    return previous;
  }
  const nextModel: UiModel = {
    ...previousModel,
    displayColor: next ?? defaultModelColor,
  }

  // We may need to update defaultWriteModel.
  const defaultWriteModel = previous.defaultWriteModel?.dsIdentifier === previousModel.dsIdentifier
    ? nextModel : previous.defaultWriteModel;

  // Now we need to replace the model in all entities.
  return {
    defaultWriteModel,
    models: replaceInArray(previousModel, nextModel, previous.models),
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

function updateModelInEntities<T extends { model: UiModel }>(
  previous: UiModel,
  next: UiModel,
  entities: T[],
): T[] {
  return entities.map(item => {
    if (item.model === previous) {
      return { ...item, model: next };
    } else {
      return item;
    }
  })
}
