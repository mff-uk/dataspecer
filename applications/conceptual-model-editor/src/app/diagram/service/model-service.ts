import { type EntityModel } from "@dataspecer/core-v2/entity-model";

import {
  type SemanticModelRelationship,
  isSemanticModelClass,
  isSemanticModelGeneralization,
  isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";

import {
  type SemanticModelClassUsage,
  type SemanticModelRelationshipUsage,
  type SemanticModelRelationshipEndUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import {
  type LanguageString,
  type SemanticModelClass,
  type SemanticModelRelationshipEnd
} from "@dataspecer/core-v2/semantic-model/concepts";

import { t, configuration } from "../application/";

/**
 * Given a model create human readable label.
 */
export function getModelLabel(model: EntityModel): string {
  const alias = model.getAlias();
  if (alias !== null) {
    return alias;
  }
  return t("model-service.model-label-from-id", model.getId());
}

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
    name = getRange(entity)?.name ?? null;
  }

  if (name === null) {
    return "";
  }

  return languageStringToHumanReadable(name, language, configuration().languagePreferences) ?? "";
}

// TODO Move to relationship-utils/utils.ts
type RelationshipEnd = SemanticModelRelationshipEnd | SemanticModelRelationshipEndUsage | null;

// TODO Move to relationship-utils/utils.ts
type DomainAndRange = {
  domain: RelationshipEnd,
  domainIndex: number | null,
  range: RelationshipEnd,
  rangeIndex: number | null
}

// TODO Move to relationship-utils/utils.ts
const getRange = (relationship: SemanticModelRelationship | SemanticModelRelationshipUsage): RelationshipEnd => {
  return getDomainAndRange(relationship)?.range || null;
};

// TODO Move to relationship-utils/utils.ts
const getDomainAndRange = (relationship: SemanticModelRelationship | SemanticModelRelationshipUsage): DomainAndRange => {
  const [first, second] = relationship.ends;

  const bothEndsAreUdefined = first === undefined || second === undefined;
  if (bothEndsAreUdefined) {
    return emptyDomainAndRange();
  }

  // When both IRIs are given we can not decide.
  const bothEndsHaveIri = first.iri !== null && second.iri !== null;
  if (bothEndsHaveIri) {
    return emptyDomainAndRange();
  }

  // Only the first one has an IRI.
  if (first.iri !== null) {
    return {
      domain: second,
      domainIndex: 1,
      range: first,
      rangeIndex: 0,
    };
  }

  // Only the second one has an IRI.
  if (second.iri !== null) {
    return {
      domain: first,
      domainIndex: 0,
      range: second,
      rangeIndex: 1,
    };
  }

  // Default.
  return emptyDomainAndRange();
};

// TODO Move to relationship-utils/utils.ts
function emptyDomainAndRange() {
  return {
    domain: null,
    domainIndex: null,
    range: null,
    rangeIndex: null,
  };
}

// TODO Move to core-v2 for working with LanguageString.

/**
 * If value contains prefered language return the value.
 *
 * If not return value with language tag for first prefered available language or any language.
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
