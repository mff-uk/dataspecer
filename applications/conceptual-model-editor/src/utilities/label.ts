import { EntityModel } from "@dataspecer/core-v2";
import { LanguageString } from "@dataspecer/core-v2/semantic-model/concepts";
import { type TranslationFunction } from "../application";
import { CmeSemanticModel } from "../dataspecer/cme-model";

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

  /**
   * Identifier of the owner vocabulary.
   */
  vocabularyDsIdentifier: string;

}

/**
 * Return a new array, where no two entities have identical label.
 */
export function sanitizeDuplicitiesInRepresentativeLabels<Type extends LabeledEntity>(
  vocabularies: CmeSemanticModel[],
  entities: Type[],
): Type[] {
  // Local functions to create vocabulary key.
  const createVocabularyKey = (language: string, vocabulary: string): string =>
    language + ":" + vocabulary;

  // Create label map for vocabularies.
  // For a key "language:identifier" we store a label.
  // Label can be provided, default, or empty string.
  const vocabularyLabelMap: Record<string, string> = {};
  for (const vocabulary of vocabularies) {
    for (const language in vocabulary.displayLabel) {
      vocabularyLabelMap[createVocabularyKey(language, vocabulary.dsIdentifier)] =
        vocabulary.displayLabel[language];
    }
  }

  const getVocabularyLabel = (language: string, vocabulary: string): string => {
    const vocabularyKey = createVocabularyKey(language, vocabulary);
    const defaultVocabularyKey = createVocabularyKey("", vocabulary);
    return vocabularyLabelMap[vocabularyKey] ?? vocabularyLabelMap[defaultVocabularyKey] ?? "";
  }

  // Local function to create entity collision keys.
  const createCollisionKeys = (language: string, entity: LabeledEntity): {
    collisionKey: string,
    modelCollisionKey: string,
  } => {
    const label = entity.label[language];
    // We know models are not really using languages.
    const vocabularyLabel = getVocabularyLabel(language, entity.vocabularyDsIdentifier);
    return {
      collisionKey: language + ":" + label,
      modelCollisionKey: language + ":" + label + ":" + vocabularyLabel,
    };
  };

  // Next, we collect colliding labels on two levels.
  // First we store collisions for "language:entity-label".
  // Second for "language:entity-label:model-label".
  const collisions: Record<string, number> = {};
  const vocabularyCollisions: Record<string, number> = {};
  for (const entity of entities) {
    for (const language in entity.label) {
      // Obtain collision keys.
      const { collisionKey, modelCollisionKey } =
        createCollisionKeys(language, entity);
      // Store information in a collision map.
      collisions[collisionKey] = (collisions[collisionKey] ?? 0) + 1;
      vocabularyCollisions[modelCollisionKey] =
        (vocabularyCollisions[modelCollisionKey] ?? 0) + 1;
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
      const modelLabel = getVocabularyLabel(language, entity.vocabularyDsIdentifier);
      if (nextLabel[language].length > 0) {
        nextLabel[language] += " ";
      }
      nextLabel[language] += "[" + modelLabel + "]";
      // Check for collisions again.
      if (vocabularyCollisions[modelCollisionKey] === 1) {
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

