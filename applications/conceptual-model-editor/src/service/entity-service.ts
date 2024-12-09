import {
  type SemanticModelRelationship,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";

import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import {
  type LanguageString,
  type SemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";

import { getDomainAndRange } from "../util/relationship-utils";
import { getDuplicateNames } from "../util/name-utils";

import { t, configuration } from "../application/";
import { useEntityProxy } from "../util/detail-utils";
import { getModelLabel } from "./model-service";

type GetEntityLabelType = SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationshipUsage;

/**
 * Given an entity returns a human readable label.
 *
 * While it may not look like it getting the label is not an easy task.
 * We not only need to deal with the language but also with the type of
 * entity.
 */
export function getEntityLabel(entity: GetEntityLabelType | null, language: string): string {
  if (entity === null) {
    return "";
  }
  // We serve the special case first, for this one we
  // ignore the language.
  if (isSemanticModelGeneralization(entity)) {
    return t("generalization-label", entity.child, entity.parent);
  }
  let name: LanguageString | null = null;
  if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
    // This one is easy, we just use the name.
    name = entity.name;
  } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
    // For relationship we need to read data from range.
    name = getDomainAndRange(entity).range?.name ?? null;
  }

  if (name === null) {
    return "";
  }

  return languageStringToHumanReadable(name, language, configuration().languagePreferences) ?? "";
}

/**
 * If value contains preferred language return the value.
 *
 * If not return value with language tag for first preferred available language or any language.
 */
function languageStringToHumanReadable(value: LanguageString, language: string, languagePreferences: string[]): string | null {
  let result = value[language];
  if (result !== undefined) {
    return result;
  }

  // Preferences.
  for (const preferedLanguage of languagePreferences) {
    result = value[language];
    if (result === undefined) {
      continue;
    }
    return `${result}@${preferedLanguage}`;
  }

  // Anything.
  for (const entry of Object.entries(value)) {
    return `${entry[1]}@${entry[0]}`;
  }

  return null;
}

// We use this as older part of the utils is not cable
// working with SemanticModelEntity.
type LimitedSemanticEntity = SemanticModelClass
  | SemanticModelRelationship
  | SemanticModelClassUsage
  | SemanticModelRelationshipUsage;

export type SelectItem = {
  identifier: string;
  label: string;
};

/**
 * Given list of semantic model entities (limited version) prepares
 * values for the selection component.
 */
export const prepareSemanticModelEntitiesForSelect = (entities: LimitedSemanticEntity[]): SelectItem[] => {
  const result: SelectItem[] = [];
  const duplicateNames = getDuplicateNames(entities);

  for (const item of entities) {
    const { name, iri, model } = useEntityProxy(item);
    const displayIri = duplicateNames.has(name ?? "");

    const nameLabel = name ?? "";
    const modelLabel = model === null ? "" : `[${getModelLabel(model)}]`;
    const iriLabel = displayIri && iri !== null ? `(${iri})` : "";

    result.push({
      identifier: item.id,
      label: `${nameLabel} ${modelLabel} ${iriLabel}`,
    });
  }

  result.sort((left, right) => left.label.localeCompare(right.label));

  return result;
};
