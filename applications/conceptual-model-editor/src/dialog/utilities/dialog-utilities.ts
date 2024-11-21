import { EntityModel } from "@dataspecer/core-v2";
import { VisualModel } from "@dataspecer/core-v2/visual-model";
import { isSemanticModelClass, isSemanticModelRelationship, LanguageString, SemanticModelClass, SemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { AggregatedEntityWrapper } from "@dataspecer/core-v2/semantic-model/aggregator";

import { createLogger, configuration } from "../../application";
import { getModelLabel as getModelLabelString } from "../../service/model-service";
import { DataTypeURIs, dataTypeUriToName, isDataType } from "@dataspecer/core-v2/semantic-model/datatypes";
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelClassUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { getDomainAndRange } from "../../util/relationship-utils";

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

  profileOfIdentifiers: string[];

  usageNote: LanguageString | null;

}

/**
 * Return representation of given classes.
 */
export function representClasses(
  models: EntityModel[],
  classes: SemanticModelClass[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const model = sourceModelOfEntity(models, item.id);
    if (model === null) {
      LOG.invalidEntity(item.id, "Missing owner.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      model,
      label: item.name,
      description: item.description,
      profileOfIdentifiers: [],
      usageNote: null,
    });
  }
  return result;
}

/**
 * Return representation of class profiles.
 */
export function representClassProfiles(
  entities: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  classes: SemanticModelClassUsage[],
): EntityRepresentative[] {
  const result: EntityRepresentative[] = [];
  for (const item of classes) {
    const entity = entities[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelClassUsage(entity)) {
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

  range: string | null;

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
  relationships: SemanticModelRelationship[],
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const model = sourceModelOfEntity(models, item.id);
    if (model === null) {
      LOG.invalidEntity(item.id, "Missing owner.");
      continue;
    }
    const { domain, range } = getDomainAndRange(item);
    if (domain === null || range === null) {
      LOG.invalidEntity(item.id, "Missing ranges.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      model,
      label: range.name ?? {},
      description: range.description ?? {},
      profileOfIdentifiers: [],
      usageNote: null,
      domain: domain.concept,
      range: range.concept
    });
  }
  return result;
}

export function representRelationshipProfiles(
  entities: Record<string, AggregatedEntityWrapper>,
  models: EntityModel[],
  relationships: SemanticModelRelationshipUsage[],
): RelationshipRepresentative[] {
  const result: RelationshipRepresentative[] = [];
  for (const item of relationships) {
    const entity = entities[item.id]?.aggregatedEntity;
    if (entity === undefined) {
      LOG.invalidEntity(item.id, "Missing entity aggregation.");
      continue;
    }
    if (!isSemanticModelRelationshipUsage(entity)) {
      LOG.invalidEntity(item.id, "Aggregation of a relationship is not a relationship.");
      continue;
    }
    const model = sourceModelOfEntity(models, item.id);
    if (model === null) {
      LOG.invalidEntity(item.id, "Missing owner.");
      continue;
    }
    const { domain, range } = getDomainAndRange(entity);
    if (domain === null || range === null) {
      LOG.invalidEntity(item.id, "Missing ranges.");
      continue;
    }
    result.push({
      identifier: item.id,
      iri: item.iri,
      model,
      label: range.name ?? {},
      description: range.description ?? {},
      profileOfIdentifiers: [entity.usageOf],
      usageNote: range.usageNote,
      domain: domain.concept,
      range: range.concept
    });
  }
  return result;
}

const UNDEFINED_IDENTIFIER = ":undefined-identifier:";

/**
 * Since entity representation needs a model we return this one.
 */
class EmptyEntityModel implements EntityModel {

  id: string;

  constructor(id: string) {
    this.id = id;
  }

  getEntities() {
    return {};
  }

  subscribeToChanges() {
    return () => { };
  }

  getId() {
    return this.id;
  }

  getAlias() {
    return null
  }

  setAlias() {
    // Do nothing.
  }

};

const UNDEFINED_MODEL = new EmptyEntityModel(UNDEFINED_IDENTIFIER);

/**
 * Return a representation of undefined.
 */
export function representUndefinedClass(): EntityRepresentative {
  return {
    identifier: UNDEFINED_IDENTIFIER,
    iri: null,
    model: UNDEFINED_MODEL,
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

const OWL_MODEL = new EmptyEntityModel("https://www.w3.org/2002/07/owl");

/**
 * Return a representation of owl:Thing.
 */
export function representOwlThing() {
  return {
    identifier: OWL_THING,
    iri: null,
    model: OWL_MODEL,
    label: { "": "owl:Thing" },
    description: {},
    profileOfIdentifiers: [],
    usageNote: null,
  };
}

export function isRepresentingOwlThing(value: { identifier: string }) {
  return value.identifier === OWL_THING;
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

export function representCardinality(cardinality: [number, number | null] | undefined): Cardinality {
  if (cardinality === undefined) {
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
