import { EntityModel } from "@dataspecer/core-v2";
import { HexColor, VisualModel, isVisualModel } from "@dataspecer/core-v2/visual-model";
import { AggregatedEntityWrapper, SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";

import { entityModelToUiModel, entityModelToUiState, semanticModelChangeToUiState, } from "./aggregator-to-ui-model-adapter";
import { configuration, t } from "../../application";
import { UiModel, UiModelType, UiState } from "./ui-model";
import { EntityDsIdentifier, ModelDsIdentifier } from "../entity-model";
import { RuntimeError } from "../../application/error";
import { sortEntitiesByDisplayLabel } from "./ui-model-utilities";

export function createEmptyState(): UiState {
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

export function initializeState(
  aggregatorView: SemanticModelAggregatorView,
  visualModel: VisualModel | null,
  languages: string[],
): UiState {
  const entities = aggregatorView.getEntities();
  const models = entityModels(aggregatorView);
  const state = entityModelToUiState(
    configuration().defaultModelColor, t,
    models, models, entities, visualModel, languages);
  return {
    ...state,
    defaultWriteModel: selectWritableModel(state.models),
  };
}

const entityModels = (aggregatorView: SemanticModelAggregatorView): EntityModel[] => {
  // We know supported type is VisualModel or EntityModel.
  const result: EntityModel[] = [];
  for (const model of aggregatorView.getModels()) {
    if (isVisualModel(model)) {
      continue;
    }
    result.push(model);
  }
  return result;
};

export function onChangeSemanticModel(
  referenceModels: EntityModel[],
  visualModel: VisualModel | null,
  languages: string[],
  previousState: UiState,
  updated: AggregatedEntityWrapper[],
  removed: string[],
): UiState {
  const state = semanticModelChangeToUiState(
    updated, removed, referenceModels, visualModel, languages, previousState);
  return {
    ...state,
    defaultWriteModel: selectWritableModel(state.models),
  };
}

function selectWritableModel(models: UiModel[]): UiModel | null {
  return models.find(model => model.modelType === UiModelType.InMemorySemanticModel) ?? null;
}

/**
 * The added models should be part of the visual model.
 */
export function onAddEntityModels(
  previous: UiState,
  visualModel: VisualModel | null,
  models: EntityModel[],
): UiState {
  const nextModels = [
    ...models.map(item => entityModelToUiModel(
      configuration().defaultModelColor, t, item, visualModel)),
    ...previous.models,
  ];
  sortEntitiesByDisplayLabel(nextModels);
  return {
    ...previous,
    defaultWriteModel: selectWritableModel(nextModels),
    models: nextModels,
  };
}

/**
 * Remove model from the list of models and all entities with the model.
 */
export function onRemoveEntityModel(
  previous: UiState,
  removed: string[],
): UiState {
  let result = { ...previous };
  //
  for (const representedModel of removed) {
    const modelIndex = result.models.findIndex(
      item => item.dsIdentifier === representedModel);
    if (modelIndex === -1) {
      continue;
    }

    const filterFunction = (item: { model: UiModel }) =>
      item.model.dsIdentifier !== representedModel;

    const nextModels: UiModel[] = [
      ...result.models.slice(0, modelIndex),
      ...result.models.slice(modelIndex + 1),
    ];

    result = {
      defaultWriteModel: selectWritableModel(nextModels),
      models: nextModels,
      classes: result.classes.filter(filterFunction),
      classProfiles: result.classProfiles.filter(filterFunction),
      attributes: result.attributes.filter(filterFunction),
      attributeProfiles: result.attributeProfiles.filter(filterFunction),
      associations: result.associations.filter(filterFunction),
      associationProfiles: result.associationProfiles.filter(filterFunction),
      generalizations: result.generalizations.filter(filterFunction),
    };
  }
  return result;
}

/**
 * This is here as a placeholder.
 * Use onChangeVisualModel instead.
 */
export function onAddVisualModel(): UiState {
  throw new RuntimeError("Do not call this method!");
}

/**
 * Handle change of a visual model entity, i.e. we have a potential
 * change in a color.
 */
export function onChangeVisualModel(
  previous: UiState,
  representedModel: ModelDsIdentifier,
  color: HexColor,
): UiState {
  const modelIndex = previous.models.findIndex(
    item => item.dsIdentifier === representedModel);
  if (modelIndex === -1) {
    // There has been a change in non-present model.
    return previous;
  }
  const previousModel = previous.models[modelIndex];
  const nextModel: UiModel = {
    ...previousModel,
    displayColor: color,
  };
  // Create model.
  return {
    defaultWriteModel: previous.defaultWriteModel,
    models: [
      ...previous.models.slice(0, modelIndex),
      nextModel,
      ...previous.models.slice(modelIndex + 1),
    ],
    classes: previous.classes.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    classProfiles: previous.classProfiles.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    attributes: previous.attributes.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    attributeProfiles: previous.attributeProfiles.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    associations: previous.associations.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    associationProfiles: previous.associationProfiles.map(
      item => updateEntityModel(previousModel, nextModel, item)),
    generalizations: previous.generalizations.map(
      item => updateEntityModel(previousModel, nextModel, item)),
  };
}

function updateEntityModel<T extends {
  model: UiModel,
}>(previous: UiModel, next: UiModel, entity: T): T {
  if (entity.model.dsIdentifier === previous.dsIdentifier) {
    return {
      ...entity,
      model: next,
    };
  }
  return entity;
}

/**
 * This is here as a placeholder.
 * We do not support this operation as of now.
 * It would basically mean fallback to default model color.
 */
export function onRemoveVisualModel() {
  throw new RuntimeError("Do not call this method!");
}

/**
 * Handle addition of a visual representation for an entity.
 *
 * Use specialized function for visual models.
 */
export function onAddVisualEntity(
  previous: UiState,
  representedModel: ModelDsIdentifier,
  representedEntity: EntityDsIdentifier,
  visualIdentifier: string,
): UiState {

  // Set visualDsIdentifier to given identifier.
  const update = <T extends { visualDsIdentifier: string | null }>(item: T): T => {
    return {
      ...item,
      visualDsIdentifier: visualIdentifier,
    };
  };

  return {
    ...previous,
    classes: updateEntity(
      previous.classes,
      representedModel, representedEntity, update),
    classProfiles: updateEntity(
      previous.classProfiles,
      representedModel, representedEntity, update),
    attributes: updateEntity(
      previous.attributes,
      representedModel, representedEntity, update),
    attributeProfiles: updateEntity(
      previous.attributeProfiles,
      representedModel, representedEntity, update),
    associations: updateEntity(
      previous.associations,
      representedModel, representedEntity, update),
    associationProfiles: updateEntity(
      previous.associationProfiles,
      representedModel, representedEntity, update),
    generalizations: updateEntity(
      previous.generalizations,
      representedModel, representedEntity, update),
  };
}

function updateEntity<T extends { dsIdentifier: string, model: UiModel }>(
  items: T[],
  representedModel: ModelDsIdentifier, representedEntity: EntityDsIdentifier,
  update: (item: T) => T,
): T[] {
  const index = items.findIndex(item =>
    item.dsIdentifier === representedEntity
    || item.model.dsIdentifier === representedModel);
  if (index === -1) {
    return items;
  }
  return [
    ...items.slice(0, index),
    update(items[index]),
    ...items.slice(index + 1),
  ];
}

/**
 * Handle removal of a visual representation for an entity.
 *
 * Use specialized function for visual models.
 */
export function onRemoveVisualEntity(
  previous: UiState,
  representedModel: ModelDsIdentifier,
  representedEntity: EntityDsIdentifier,
): UiState {

  // Set visualDsIdentifier to null.
  const update = <T extends { visualDsIdentifier: string | null }>(item: T): T => {
    return {
      ...item,
      visualDsIdentifier: null,
    };
  };

  return {
    ...previous,
    classes: updateEntity(
      previous.classes,
      representedModel, representedEntity, update),
    classProfiles: updateEntity(
      previous.classProfiles,
      representedModel, representedEntity, update),
    attributes: updateEntity(
      previous.attributes,
      representedModel, representedEntity, update),
    attributeProfiles: updateEntity(
      previous.attributeProfiles,
      representedModel, representedEntity, update),
    associations: updateEntity(
      previous.associations,
      representedModel, representedEntity, update),
    associationProfiles: updateEntity(
      previous.associationProfiles,
      representedModel, representedEntity, update),
    generalizations: updateEntity(
      previous.generalizations,
      representedModel, representedEntity, update),
  };
}
