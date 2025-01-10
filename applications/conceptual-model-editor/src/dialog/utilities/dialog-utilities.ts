import { EntityModel } from "@dataspecer/core-v2";
import { LanguageString, SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { DataTypeURIs, dataTypeUriToName, isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { createLogger } from "../../application";
import { getDomainAndRange } from "../../util/relationship-utils";
import { CmeModel, OwlVocabulary, UndefinedCmeVocabulary } from "../../dataspecer/cme-model";
import { IRI } from "iri";

const LOG = createLogger(import.meta.url);

export function isRelativeIri(iri: string | undefined | null): boolean {
  if (iri === undefined || iri === null) {
    return true;
  }
  return (new IRI(iri).scheme()?.length ?? 0) === 0;
}

/**
 * Basic interface for entity representation regardless of type.
 */
export interface EntityRepresentative {

  identifier: string;

  iri: string | null;

  vocabularyDsIdentifier: string;

  label: LanguageString;

  description: LanguageString;

  profileOfIdentifiers: string[];

  usageNote: LanguageString | null;

}

export function representClasses(
  models: EntityModel[],
  vocabularies: CmeModel[],
  classes: SemanticModelClass[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const vocabulary = findOwnerVocabulary(models, vocabularies, item.id);
    if (vocabulary === null) {
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      vocabularyDsIdentifier: vocabulary.dsIdentifier,
      label: item.name,
      description: item.description,
      profileOfIdentifiers: [],
      usageNote: null,
    });
  }
  return result;
}

function findOwnerVocabulary(
  models: EntityModel[],
  vocabularies: CmeModel[],
  entityIdentifier: string,
): CmeModel | null {
  for (const model of models) {
    const entity = model.getEntities()[entityIdentifier];
    if (entity === undefined) {
      continue;
    }
    const vocabulary = vocabularies.find(item => item.dsIdentifier === model.getId());
    return vocabulary ?? null;
  }
  LOG.invalidEntity(entityIdentifier, "Entity is without an model.");
  return null;
};

export function representClassProfiles(
  aggregations: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  vocabularies: CmeModel[],
  classes: SemanticModelClassUsage[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const entity = aggregations[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelClassUsage(entity)) {
      LOG.invalidEntity(item.id, "Aggregation of a class is not a class.");
      continue;
    }
    const vocabulary = findOwnerVocabulary(models, vocabularies, item.id);
    if (vocabulary === null) {
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      vocabularyDsIdentifier: vocabulary.dsIdentifier,
      label: entity.name ?? {},
      description: entity.description ?? {},
      profileOfIdentifiers: [entity.usageOf],
      usageNote: entity.usageNote,
    });
  }
  return result;
}

/**
 * Specialization of entity to capture information about relationships.
 */
export interface RelationshipRepresentative extends EntityRepresentative {

  domain: string | null;

  domainCardinality: Cardinality;

  range: string | null;

  rangeCardinality: Cardinality;

}

export function isRepresentingAssociation(representation: RelationshipRepresentative): boolean {
  return !isRepresentingAttribute(representation);
}

export function isRepresentingAttribute(representation: RelationshipRepresentative): boolean {
  const range = representation.range;
  // We have multiple ways to detect an attribute.
  // The first one is there is no range concept.
  return range === null
    || range === ""
    // Range is a data type.
    || isDataType(range)
    // Temporary workaround for SKOS #449
    || representation.identifier.endsWith("#attribute");
}

export function representRelationships(
  models: EntityModel[],
  vocabularies: CmeModel[],
  relationships: SemanticModelRelationship[],
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const vocabulary = findOwnerVocabulary(models,vocabularies, item.id);
    if (vocabulary === null) {
      continue;
    }
    const { domain, range } = getDomainAndRange(item);
    if (domain === null || range === null) {
      LOG.invalidEntity(item.id, "Missing ends.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      vocabularyDsIdentifier: vocabulary.dsIdentifier,
      label: range.name ?? {},
      description: range.description ?? {},
      profileOfIdentifiers: [],
      usageNote: null,
      domain: domain.concept,
      domainCardinality: representCardinality(domain.cardinality),
      range: range.concept,
      rangeCardinality: representCardinality(range.cardinality),
    });
  }
  return result;
}

export function representRelationshipProfiles(
  aggregations: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  vocabularies: CmeModel[],
  relationships: SemanticModelRelationshipUsage[],
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const entity = aggregations[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelRelationshipUsage(entity)) {
      LOG.invalidEntity(item.id, "Aggregation of a relationship is not a relationship.");
      continue;
    }
    const vocabulary = findOwnerVocabulary(models, vocabularies, item.id);
    if (vocabulary === null) {
      continue;
    }
    const { domain, range } = getDomainAndRange(entity);
    if (domain === null || range === null) {
      LOG.invalidEntity(item.id, "Missing ends.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      vocabularyDsIdentifier: vocabulary.dsIdentifier,
      label: range.name ?? {},
      description: range.description ?? {},
      profileOfIdentifiers: [entity.usageOf],
      usageNote: range.usageNote,
      domain: domain.concept,
      domainCardinality: representCardinality(domain.cardinality),
      range: range.concept,
      rangeCardinality: representCardinality(range.cardinality),
    });
  }
  return result;
}

const UNDEFINED_IDENTIFIER = ":undefined-identifier:";

/**
 * Return a representation of undefined.
 */
export function representUndefinedClass(): EntityRepresentative {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    iri: null,
    vocabularyDsIdentifier: UndefinedCmeVocabulary.dsIdentifier,
    label: { "": "Undefined" },
    description: {},
    profileOfIdentifiers: [],
    usageNote: null,
  };
}

export function isRepresentingUndefined(value: { identifier: string }) {
  return value.identifier === UNDEFINED_IDENTIFIER;
}

const OWL_THING = "https://www.w3.org/2002/07/owl#Thing";

/**
 * Return a representation of owl:Thing.
 */
export function representOwlThing() : EntityRepresentative {
  return {
    identifier: OWL_THING,
    iri: null,
    vocabularyDsIdentifier: OwlVocabulary.dsIdentifier,
    label: { "": "owl:Thing" },
    description: {},
    profileOfIdentifiers: [],
    usageNote: null,
  };
}

export function isRepresentingOwlThing(value: { identifier: string }) {
  return value.identifier === OWL_THING;
}

export interface DataTypeRepresentative {

  identifier: string;

  label: LanguageString;

}

/**
 * Return representation of all data types.
 */
export function representDataTypes(): DataTypeRepresentative[] {
  const values = DataTypeURIs.map(iri => ({
    identifier: iri,
    label: { "": dataTypeUriToName(iri) ?? iri },
  }));
  return values;
}

const RDFS_LITERAL = "http://www.w3.org/2000/01/rdf-schema#Literal";

/**
 * Return representation for rdfs:Literal.
 */
export function selectRdfLiteral(dataTypes: DataTypeRepresentative[]): DataTypeRepresentative {
  return dataTypes.find(item => item.identifier === RDFS_LITERAL)!;
}

/**
 * Return data type representation for undefined value.
 */
export function representUndefinedDataType(): DataTypeRepresentative {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    label: { "": "Undefined" },
  };
}

export interface Cardinality {

  identifier: string;

  label: string;

  /**
   * Dataspecer value for cardinality.
   */
  cardinality: [number, number | null] | undefined;

}

const CARDINALITIES: Cardinality[] = [
  {
    identifier: "0x",
    label: "0..*",
    cardinality: [0, null],
  }, {
    identifier: "01",
    label: "0..1",
    cardinality: [0, 1],
  }, {
    identifier: "1x",
    label: "1..*",
    cardinality: [1, null],
  }, {
    identifier: "11",
    label: "1..1",
    cardinality: [1, 1],
  },
]

export function representCardinalities(): Cardinality[] {
  return CARDINALITIES;
};

export function representCardinality(cardinality: [number, number | null] | null | undefined): Cardinality {
  if (cardinality === undefined || cardinality === null) {
    return representUndefinedCardinality();
  }
  const [from, to] = cardinality;
  for (const cardinality of CARDINALITIES) {
    if (cardinality.cardinality?.[0] === from
      && cardinality.cardinality?.[1] === to) {
      return cardinality;
    }
  }
  LOG.error("Unknown cardinality.", { cardinality });
  return CARDINALITIES[0];
}

export function representUndefinedCardinality(): Cardinality {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    label: "Undefined",
    cardinality: undefined,
  };
};

/**
 * Perform in-place sort by label using given language.
 */
export function sortRepresentatives<T extends { label: LanguageString }>(
  language: string,
  array: T[],
) {
  array.sort((left, right) => {
    const leftLabel = left.label[language] ?? left.label[""] ?? "";
    const rightLabel = right.label[language] ?? right.label[""] ?? "";
    return leftLabel.localeCompare(rightLabel);
  });
}

/**
 * Find and return representative of entity with given identifier.
 */
export function findRepresentative(entities: EntityRepresentative[], identifier: string | null | undefined): EntityRepresentative | null {
  if (identifier === null || identifier === undefined) {
    return null;
  }
  return entities.find(item => item.identifier === identifier) ?? null;
}

export interface Specialization {

  /**
   * Identification of an entity representing the specialization.
   */
  identifier: string | undefined;

  specialized: string;

  iri: string;

}

export function representSpecializations(
  identifier: string,
  generalizations: SemanticModelGeneralization[],
): Specialization[] {
  return generalizations.filter(item => item.child === identifier)
    .map(item => ({
      identifier: item.id,
      iri: item.iri ?? "",
      specialized: item.parent,
    }));
}
