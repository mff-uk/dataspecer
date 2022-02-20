import {
  StructureModel,
  StructureModelClass,
  StructureModelComplexType,
  StructureModelProperty,
} from "../model";
import { assertFailed, assertNot } from "../../core";

/**
 * Dematerialize association by moving their content to their owner.
 */
export function structureModelDematerialize(
  structure: StructureModel
): StructureModel {
  const result = { ...structure, classes: {} } as StructureModel;
  for (const [iri, classData] of Object.entries(structure.classes)) {
    result.classes[iri] = {
      ...classData,
      properties: dematerializeClassProperties(structure, classData),
    };
  }
  return result;
}

function dematerializeClassProperties(
  structure: StructureModel,
  classData: StructureModelClass,
  visited: string[] = []
): StructureModelProperty[] {
  assertNot(
    visited.includes(classData.psmIri),
    `Cycle detected during dematerialization for '${classData.psmIri}'.`
  );
  visited = [...visited, classData.psmIri];
  const result = [];
  for (const property of classData.properties) {
    // We need to be explicit here, only if value is true we shall
    // dematerialize the property.
    if (property.dematerialize !== true) {
      result.push(property);
      continue;
    }
    if (isPropertyArray(property)) {
      // We start with array, as it is the most general.
      assertFailed(
        `It is not supported to dematerialize array '${classData.psmIri}'.`
      );
    }
    const isOptional = isPropertyOptional(property);
    for (const type of collectComplexTypes(classData, property)) {
      const typeClassData = structure.classes[type.psmClassIri];
      assertNot(
        typeClassData === undefined,
        `Missing type '${typeClassData}'.`
      );
      dematerializeClassProperties(structure, typeClassData, visited).forEach(
        (property) => {
          const propertyClone = { ...property } as StructureModelProperty;
          if (isOptional) {
            propertyClone.cardinalityMin = 0;
          }
          propertyClone.pathToOrigin.push({
            psmProperty: property.psmIri,
            psmTargetClass: typeClassData.psmIri,
          });
          result.push(propertyClone);
        }
      );
    }
  }
  return result;
}

function isPropertyOptional(propertyData: StructureModelProperty) {
  return (propertyData.cardinalityMin ?? 0) < 1;
}

function isPropertyArray(propertyData: StructureModelProperty) {
  return (propertyData.cardinalityMax ?? 2) > 1;
}

function collectComplexTypes(
  classData: StructureModelClass,
  propertyData: StructureModelProperty
): StructureModelComplexType[] {
  const result = [];
  for (const type of propertyData.dataTypes) {
    if (type.isAssociation()) {
      result.push(type);
    } else if (type.isAttribute()) {
      assertFailed(
        "Attributes are not supported for dematerialization " +
          `'${classData.psmIri}'.`
      );
    } else {
      assertFailed(`Unknown type in '${classData.psmIri}'.`);
    }
  }
  return result;
}
