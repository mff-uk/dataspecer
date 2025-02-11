import { EntityModel } from "@dataspecer/core-v2";
import { LanguageString, SemanticModelClass, SemanticModelGeneralization, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";
import { DataTypeURIs, dataTypeUriToName, isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { SemanticModelClassUsage, SemanticModelRelationshipUsage, isSemanticModelClassUsage, isSemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { createLogger } from "../../application";
import { getDomainAndRange } from "../../util/relationship-utils";
import { CmeModel, OwlVocabulary, UndefinedCmeVocabulary } from "../../dataspecer/cme-model";
import { EntityDsIdentifier } from "../../dataspecer/entity-model";
import { ClassesContextType } from "../../context/classes-context";
import { ModelGraphContextType } from "../../context/model-context";
import { isSemanticModelClassProfile, isSemanticModelRelationshipProfile, SemanticModelClassProfile, SemanticModelRelationshipProfile } from "@dataspecer/core-v2/semantic-model/profile/concepts";

const LOG = createLogger(import.meta.url);

/**
 * We use this to identify representant of undefined.
 */
const UNDEFINED_IDENTIFIER = ":undefined-identifier:";

/**
 * Default value for entities.
 */
const OWL_THING_IDENTIFIER = "https://www.w3.org/2002/07/owl#Thing";

/**
 * Default value for data types.
 */
const RDFS_LITERAL_IDENTIFIER = "http://www.w3.org/2000/01/rdf-schema#Literal";

export function isRepresentingUndefine(item: { identifier: string }): boolean {
  return item.identifier === UNDEFINED_IDENTIFIER;
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

  /**
   * As profile must profile at least one entity,
   * this is empty when this class is not a profile.
   */
  profileOfIdentifiers: string[];

  usageNote: LanguageString | null;

  isProfile: boolean;

}

const UNDEFINED_CLASS: EntityRepresentative = {
  identifier: UNDEFINED_IDENTIFIER,
  iri: null,
  vocabularyDsIdentifier: UndefinedCmeVocabulary.dsIdentifier,
  label: { "": "Undefined" },
  description: {},
  profileOfIdentifiers: [],
  usageNote: null,
  isProfile: false,
};

export function representUndefinedClass(): EntityRepresentative {
  return UNDEFINED_CLASS;
}

const UNDEFINED_CLASS_PROFILE: EntityRepresentative = {
  ...UNDEFINED_CLASS,
  isProfile: true,
};

export function representUndefinedClassProfile(): EntityRepresentative {
  return UNDEFINED_CLASS_PROFILE;
}

const OWL_THING: EntityRepresentative = {
  identifier: OWL_THING_IDENTIFIER,
  iri: null,
  vocabularyDsIdentifier: OwlVocabulary.dsIdentifier,
  label: { "": "owl:Thing" },
  description: {},
  profileOfIdentifiers: [],
  usageNote: null,
  isProfile: false,
};

export function representOwlThing(): EntityRepresentative {
  return OWL_THING;
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
      isProfile: false,
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

export function representClassUsages(
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
      isProfile: true,
    });
  }
  return result;
}

export function representClassProfiles(
  aggregations: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  vocabularies: CmeModel[],
  classes: SemanticModelClassProfile[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const entity = aggregations[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelClassProfile(entity)) {
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
      profileOfIdentifiers: entity.profiling,
      usageNote: entity.usageNote,
      isProfile: true,
    });
  }
  return result;
}

/**
 * Result can be used to select what to profile class from.
 *
 * @returns classes, class profiles.
 */
export function listClassToProfiles(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeModel[],
): EntityRepresentative[] {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  return [
    ...representClasses(models, vocabularies, classesContext.classes),
    ...representClassUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelClassUsage(item))),
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.classProfiles),
  ];
}

/**
 * Result can be used for association ends and attribute domain.
 *
 * @returns owl:Thing, classes.
 */
export function listRelationshipDomains(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeModel[],
): EntityRepresentative[] {
  const models = [...graphContext.models.values()];

  return [
    representOwlThing(),
    ...representClasses(models, vocabularies, classesContext.classes)
  ]
}

/**
 * Result can be used for association profile ends and attribute profile domain.
 *
 * @returns owl:Thing, classes, class profiles.
 */
export function listRelationshipProfileDomains(
  classesContext: ClassesContextType,
  graphContext: ModelGraphContextType,
  vocabularies: CmeModel[],
): EntityRepresentative[] {
  const entities = graphContext.aggregatorView.getEntities();
  const models = [...graphContext.models.values()];

  return [
    representOwlThing(),
    ...representClassUsages(entities, models, vocabularies,
      classesContext.usages.filter(item => isSemanticModelClassUsage(item))),
    ...representClassProfiles(entities, models, vocabularies,
      classesContext.classProfiles),
  ]
}

/**
 * Specialization of entity to capture information about relationships.
 */
export interface RelationshipRepresentative extends EntityRepresentative {

  domain: string;

  domainCardinality: Cardinality;

  range: string;

  rangeCardinality: Cardinality;

}

export function isRepresentingAssociation(representation: RelationshipRepresentative): boolean {
  return !isRepresentingAttribute(representation);
}

export function isRepresentingAttribute(representation: {
  identifier: EntityDsIdentifier, range: string,
}): boolean {
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
  defaultDomain: string,
  defaultRange: string,
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const vocabulary = findOwnerVocabulary(models, vocabularies, item.id);
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
      domain: domain.concept ?? defaultDomain,
      domainCardinality: representCardinality(domain.cardinality),
      range: range.concept ?? defaultRange,
      rangeCardinality: representCardinality(range.cardinality),
      isProfile: false,
    });
  }
  return result;
}

export function representRelationshipUsages(
  aggregations: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  vocabularies: CmeModel[],
  relationships: SemanticModelRelationshipUsage[],
  defaultDomain: string,
  defaultRange: string,
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const entity = aggregations[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelRelationshipUsage(entity)) {
      LOG.invalidEntity(item.id, "Invalid aggregation.");
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
      domain: domain.concept ?? defaultDomain,
      domainCardinality: representCardinality(domain.cardinality),
      range: range.concept ?? defaultRange,
      rangeCardinality: representCardinality(range.cardinality),
      isProfile: true,
    });
  }
  return result;
}

export function representRelationshipProfile(
  aggregations: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  vocabularies: CmeModel[],
  relationships: SemanticModelRelationshipProfile[],
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const entity = aggregations[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelRelationshipProfile(entity)) {
      LOG.invalidEntity(item.id, "Invalid aggregation.");
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
      iri: range.iri,
      vocabularyDsIdentifier: vocabulary.dsIdentifier,
      label: range.name ?? {},
      description: range.description ?? {},
      profileOfIdentifiers: range.profiling,
      usageNote: range.usageNote,
      domain: domain.concept,
      domainCardinality: representCardinality(domain.cardinality),
      range: range.concept,
      rangeCardinality: representCardinality(range.cardinality),
      isProfile: true,
    });
  }
  return result;
}

export function representUndefinedAttribute(): RelationshipRepresentative {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    iri: null,
    vocabularyDsIdentifier: UndefinedCmeVocabulary.dsIdentifier,
    label: { "": "Undefined" },
    description: {},
    profileOfIdentifiers: [],
    usageNote: null,
    domain: OWL_THING_IDENTIFIER,
    domainCardinality: representUndefinedCardinality(),
    range: RDFS_LITERAL_IDENTIFIER,
    rangeCardinality: representUndefinedCardinality(),
    isProfile: false,
  };
}

export function representUndefinedAssociation(): RelationshipRepresentative {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    iri: null,
    vocabularyDsIdentifier: UndefinedCmeVocabulary.dsIdentifier,
    label: { "": "Undefined" },
    description: {},
    profileOfIdentifiers: [],
    usageNote: null,
    domain: OWL_THING_IDENTIFIER,
    domainCardinality: representUndefinedCardinality(),
    range: OWL_THING_IDENTIFIER,
    rangeCardinality: representUndefinedCardinality(),
    isProfile: false,
  };
}

export interface DataTypeRepresentative {

  identifier: string;

  label: LanguageString;

}

const RDFS_LITERAL: DataTypeRepresentative = {
  identifier: RDFS_LITERAL_IDENTIFIER,
  label: { "": "rdfs:Literal" },
};

export function representRdfsLiteral(): DataTypeRepresentative {
  return RDFS_LITERAL;
}

const UNDEFINED_DATA_TYPE: DataTypeRepresentative = {
  identifier: UNDEFINED_IDENTIFIER,
  label: { "": "Undefined" },
};

export function representUndefinedDataType(): DataTypeRepresentative {
  return UNDEFINED_DATA_TYPE;
}

const CORE_DATA_TYPE: DataTypeRepresentative[] = DataTypeURIs.map(iri => ({
  identifier: iri,
  label: { "": dataTypeUriToName(iri) ?? iri },
}));

/**
 * @returns undefined, data types
 */
export function listAttributeRanges(): DataTypeRepresentative[] {
  return [
    representUndefinedDataType(),
    ...CORE_DATA_TYPE,
  ];
}

/**
 * @returns data types
 */
export function listAttributeProfileRanges(): DataTypeRepresentative[] {
  return CORE_DATA_TYPE;
}

export interface Cardinality {

  identifier: string;

  label: string;

  /**
   * Dataspecer value for cardinality.
   */
  cardinality: [number, number | null] | null;

}

const UNDEFINED_CARDINALITY: Cardinality = {
  identifier: UNDEFINED_IDENTIFIER,
  label: "Undefined",
  cardinality: null,
};

export function representUndefinedCardinality() {
  return UNDEFINED_CARDINALITY;
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

export function listCardinalities(): Cardinality[] {
  return [
    representUndefinedCardinality(),
    ...CARDINALITIES,
  ];
};

export function representCardinality(
  cardinality: [number, number | null] | null | undefined,
): Cardinality {
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
  return representUndefinedCardinality();
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

export function selectDefaultModelForAttribute(
  entity: EntityDsIdentifier,
  entityModels: EntityModel[],
  cmeModels: CmeModel[],
): CmeModel {
  for (const model of entityModels) {
    if (model.getEntities()[entity] === undefined) {
      continue;
    }
    // We found the model.
    const result = cmeModels.find(item => item.dsIdentifier === model.getId());
    if (result === undefined) {
      // We found the model but have no representation.
      break;
    }
    return result;
  }
  // Just return the first model.
  return cmeModels[0];
}
