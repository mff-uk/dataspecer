import { EntityModel } from "@dataspecer/core-v2";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClass, LanguageString, SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { createLogger, configuration } from "../application";
import {getModelLabel as getModelLabelString} from "../service/model-service";

const LOG = createLogger(import.meta.url);

/**
 * Select and return only writable models.
 */
export function selectWritableModels(models: EntityModel[]): InMemorySemanticModel[] {
  return models.filter(model => model instanceof InMemorySemanticModel);
}

export interface EntityModelRepresentative<ModelType extends EntityModel> {

  identifier: string;

  label: LanguageString;

  model: ModelType;

  color: string;

}

/**
 * Return representation of given models.
 */
export function representModels<ModelType extends EntityModel>(
  visualModel: VisualModel | null,
  models: ModelType[],
): EntityModelRepresentative<ModelType>[] {
  return models.map(model => ({
    identifier: model.getId(),
    label: getModelLabel(model),
    model,
    color: visualModel?.getModelColor(model.getId()) ?? configuration().defaultModelColor,
  }));
}

const DEFAULT_MODEL_LABEL_LANGUAGE = "";

/**
 * Return model label as a language string.
 */
export function getModelLabel(model: EntityModel | undefined | null): LanguageString {
  return { [DEFAULT_MODEL_LABEL_LANGUAGE]: getModelLabelString(model) ?? "" };
}

/**
 * Basic interface for entity representation regardless of type.
 */
export interface EntityRepresentative {

  identifier: string;

  iri: string | null;

  model: EntityModel;

  label: LanguageString;

  description: LanguageString;

}

/**
 * Return representation of all classes.
 */
export function representClasses(
  entities: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  classes: SemanticModelClass[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const entity = entities[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelClass(entity)) {
      LOG.invalidEntity(item.id, "Aggregation of a class is not a class.");
      continue;
    }
    const model = sourceModelOfEntity(models, item.id);
    if (model === null) {
      LOG.invalidEntity(item.id, "Missing owner.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      model,
      label: entity.name,
      description: entity.description,
    });
  }
  return result;
}

const sourceModelOfEntity = (models: EntityModel[], entityIdentifier: string): EntityModel | null => {
  for (const model of models) {
    const entity = model.getEntities()[entityIdentifier];
    if (entity !== undefined) {
      return model;
    }
  }
  return null;
};
