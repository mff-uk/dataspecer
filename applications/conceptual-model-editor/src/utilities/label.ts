import { EntityModel } from "@dataspecer/core-v2";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { type TranslationFunction } from "../application";

/**
 * Return a label that should be used for a model.
 */
export type ModelLabelSelector = (model: EntityModel | undefined | null) => LanguageString;

export const createGetModelLabel = (t: TranslationFunction) => {
  return (model: EntityModel | undefined | null): LanguageString => {
    if (model === undefined || model === null) {
      return {};
    }
    const alias = model.getAlias();
    if (alias !== null) {
      return { "": alias };
    }
    return { "": t("model-service.model-label-from-id", model.getId()) };
  };
};

/**
 * Represent an entity with a label.
 */
interface Labeled {

  identifier: string;

  label: LanguageString;

}

/**
 * Represent and entity with IRI that is in a model.
 */
interface LabeledEntity extends Labeled {

  iri: string | null;

  model: EntityModel;

}

/**
 * Return a new array, where not two entities have identical label.
 */
export function sanitizeDuplicitiesInRepresentativeLabels<Type extends LabeledEntity>(
  models: Labeled[],
  entities: Type[],
): Type[] {
  // Local functions to create model key.
  const createModelKey = (language: string, model: string): string =>
    language + ":" + model;

  // Create model label map.
  // For a model key "language:identifier" we store a label.
  // Label can be provided, default, or empty string.
  const modelLabelMap: Record<string, string> = {};
  for (const model of models) {
    for (const language in model.label) {
      modelLabelMap[createModelKey(language, model.identifier)] =
        model.label[language];
    }
  }

  const getModelLabel = (language: string, model: string): string => {
    const modelKey = createModelKey(language, model);
    const defaultModelKey = createModelKey("", model);
    return modelLabelMap[modelKey] ?? modelLabelMap[defaultModelKey] ?? "";
  }

  // Local function to create entity collision keys.
  const createCollisionKeys = (language: string, entity: LabeledEntity): {
    collisionKey: string,
    modelCollisionKey: string,
  } => {
    const label = entity.label[language];
    // We know models are not really using languages.
    const modelLabel = getModelLabel(language, entity.model.getId());
    return {
      collisionKey: language + ":" + label,
      modelCollisionKey: language + ":" + label + ":" + modelLabel,
    };
  };

  // Next, we collect colliding labels on two levels.
  // First we store collisions for "language:entity-label".
  // Second for "language:entity-label:model-label".
  const collisions: Record<string, number> = {};
  const modelCollisions: Record<string, number> = {};
  for (const entity of entities) {
    for (const language in entity.label) {
      // Obtain collision keys.
      const { collisionKey, modelCollisionKey } =
        createCollisionKeys(language, entity);
      // Store information in a collision map.
      collisions[collisionKey] = (collisions[collisionKey] ?? 0) + 1;
      modelCollisions[modelCollisionKey] =
        (modelCollisions[modelCollisionKey] ?? 0) + 1;
    }
  }

  // In the last step we iterate over all entities, assigning their final label.
  // We utilize the collision maps to determine what level of label to assign.
  const result: Type[] = [];
  for (const entity of entities) {
    const nextLabel: LanguageString = {};
    for (const language in entity.label) {
      // Start with entity label.
      nextLabel[language] = entity.label[language];
      // Obtain collision keys.
      const { collisionKey, modelCollisionKey } =
        createCollisionKeys(language, entity);
      // Check for collisions.
      if (collisions[collisionKey] === 1) {
        // There is no collision, first level label.
        // We just use the label of the entity alone.
        continue;
      }
      // Ok add model label.
      // We know models are not really using languages.
      const modelLabel = getModelLabel(language, entity.model.getId());
      if (nextLabel[language].length > 0) {
        nextLabel[language] += " ";
      }
      nextLabel[language] += "[" + modelLabel + "]";
      // Check for collisions again.
      if (modelCollisions[modelCollisionKey] === 1) {
        // There is collision only on label level, second level label.
        continue;
      }
      // We also add information about IRI.
      if (entity.iri !== null) {
        nextLabel[language] += " (" + entity.iri + ")";
      }
    }
    result.push({
      ...entity,
      label: nextLabel,
    });
  }

  return result;
}


