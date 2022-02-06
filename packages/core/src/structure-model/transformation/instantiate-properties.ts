import {
  StructureModel,
  StructureModelClass,
  StructureModelProperty,
} from "../model";

/**
 * Copy properties from extending classes to the specializations, effectively
 * flattening the class hierarchy.
 */
export function structureModelFlattenInheritance(
  structure: StructureModel
): StructureModel {
  const result = { ...structure, classes: {} } as StructureModel;
  for (const [iri, classData] of Object.entries(structure.classes)) {
    result.classes[iri] = {
      ...classData,
      properties: collectProperties(classData),
    };
  }
  return result;
}

function collectProperties(
  classData: StructureModelClass
): StructureModelProperty[] {
  const result = [...classData.properties];
  const visited = new Set();
  const stack = [...classData.extends];
  while (stack.length > 0) {
    const ancestorClass = stack.pop();
    if (ancestorClass === null || ancestorClass === undefined) {
      continue;
    }
    if (visited.has(ancestorClass.psmIri)) {
      continue;
    }
    visited.add(ancestorClass.psmIri);
    //
    result.push(...ancestorClass.properties);
    stack.push(...ancestorClass.extends);
  }
  return result;
}
