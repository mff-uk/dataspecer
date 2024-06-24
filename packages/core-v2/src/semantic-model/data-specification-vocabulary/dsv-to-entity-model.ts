import {
  SemanticModelEntity,
  isSemanticModelClass,
  isSemanticModelRelationship as isSemanticModelRelationshipPartial,
  isSemanticModelAttribute,
  SemanticModelRelationship,
} from "../concepts";

import {
  SemanticModelClassUsage,
  SemanticModelRelationshipUsage,
  isSemanticModelClassUsage,
  isSemanticModelRelationshipUsage as isSemanticModelRelationshipUsagePartial,
  isSemanticModelAttributeUsage,
} from "../usage/concepts";

import {
  EntityListContainer,
} from "./entity-model";

import {
  LanguageString,
  ConceptualModel,
  Cardinality,
  ClassProfile,
  ClassProfileType,
  PropertyProfile,
  ObjectPropertyProfile,
  ObjectPropertyProfileType,
  DatatypePropertyProfile,
  DatatypePropertyProfileType,
} from "./dsv-model";

export function conceptualModelToEntityListContainer(conceptualModel: ConceptualModel): EntityListContainer {
  const result: EntityListContainer = {
    baseIri: null,
    entities: [],
  };

  return result;
}
