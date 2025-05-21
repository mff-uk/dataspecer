import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isSemanticModelClass, isSemanticModelGeneralization, isSemanticModelRelationship, SemanticModel } from "../semantic-model/index.ts";
import { OwlOntology, OwlClass, OwlProperty, IRI, OwlPropertyType } from "./lightweight-owl-model.ts";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { isComplexType, isPrimitiveType } from "@dataspecer/core-v2/semantic-model/datatypes";

const OWL_THING = "http://www.w3.org/2002/07/owl#Thing";

export function semanticModelToLightweightOwl(
  semanticModel: SemanticModel,
  context: {
    idDefinedBy: string,
  }
): OwlOntology {
  const baseIri = semanticModel instanceof InMemorySemanticModel
    ? semanticModel.getBaseIri() : "";

  // We start by processing classes as they are referenced from
  // properties and generalizations.
  const { classes, classMapId } = prepareOwlClasses(
    semanticModel, baseIri, context.idDefinedBy);

  // Next we load relationships.
  const { properties, propertyMapId } = prepareOwlProperties(
    semanticModel, baseIri, context.idDefinedBy);

  // Last we load generalizations.
  loadGeneralizations(semanticModel, classMapId, propertyMapId);

  return {
    classes,
    properties,
  };
}

function prepareOwlClasses(
  semanticModel: SemanticModel,
  baseIri: string,
  idDefinedBy: string,
): {
  classes: OwlClass[],
  classMapId: { [identifier: string]: OwlClass },
} {
  const classes: OwlClass[] = [];
  const classMapId: { [identifier: string]: OwlClass } = {};
  for (const entity of Object.values(semanticModel.getEntities())) {
    if (!isSemanticModelClass(entity)) {
      continue;
    }
    const newClass: OwlClass = {
      iri: baseIri + (entity.iri ?? entity.id),
      name: entity.name,
      description: entity.description,
      subClassOf: [],
      isDefinedBy: idDefinedBy,
    };
    classes.push(newClass);
    classMapId[entity.id] = newClass;
  }
  return { classes, classMapId };
}

function prepareOwlProperties(
  semanticModel: SemanticModel,
  baseIri: string,
  idDefinedBy: string,
): {
  properties: OwlProperty[],
  propertyMapId: { [identifier: string]: OwlProperty },
} {
  const properties: OwlProperty[] = [];
  const propertyMapId: { [identifier: string]: OwlProperty } = {};
  for (const entity of Object.values(semanticModel.getEntities())) {
    if (!isSemanticModelRelationship(entity)) {
      continue;
    }
    const ends = getDomainAndRange(entity);
    const domainEnd = ends?.domain;
    const rangeEnd = ends?.range;
    const iri = baseIri + (rangeEnd?.iri ?? entity.iri ?? entity.id);
    const range = rangeEnd?.concept ?? OWL_THING;
    const newProperty: OwlProperty = {
      iri,
      name: rangeEnd?.name ?? {},
      description: rangeEnd?.description ?? {},
      isDefinedBy: idDefinedBy,
      subPropertyOf: [],
      domain: domainEnd?.concept ?? OWL_THING,
      range,
      type: determineType(range),
    };
    properties.push(newProperty);
    propertyMapId[entity.id] = newProperty;
  }
  return { properties, propertyMapId };
}

function determineType(range: IRI): OwlPropertyType | null {
  const isPrimitive = isPrimitiveType(range);
  const isComplex = isComplexType(range);
  if (isPrimitive && !isComplex) {
    return OwlPropertyType.DatatypeProperty;
  } else if (!isPrimitive && isComplex) {
    return OwlPropertyType.ObjectProperty;
  } else {
    // We can not decide.
    return null;
  }
}

function loadGeneralizations(
  semanticModel: SemanticModel,
  classMapId: { [identifier: string]: OwlClass },
  propertyMapId: { [identifier: string]: OwlProperty },
) {
  for (const entity of Object.values(semanticModel.getEntities())) {
    if (!isSemanticModelGeneralization(entity)) {
      continue;
    }
    // We can have generalization of a class ...
    const classChild = classMapId[entity.child];
    if (classChild !== null) {
      const parent = classMapId[entity.parent]?.iri ?? entity.parent;
      classChild.subClassOf.push(parent);
    }
    // or a property.
    const propertyChild = propertyMapId[entity.child];
    if (propertyChild !== null) {
      const parent = propertyMapId[entity.parent]?.iri ?? entity.parent;
      classChild.subClassOf.push(parent);
    }
  }
}
