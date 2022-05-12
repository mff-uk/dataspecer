import {StructureModel, StructureModelClass,} from "../model/base";
import {clone} from "../../core";

/**
 * Copy properties from extending classes to the specializations, effectively
 * flattening the class hierarchy.
 */
export function structureModelFlattenInheritance(
  structure: StructureModel
): StructureModel {
  const result = clone(structure) as StructureModel;
  const classes = result.getClasses();
  for (const classData of classes) {
    classData.properties = findTopologicalSortOfExtends(classData)
      .flatMap(cls => cls.properties);
  }
  return result;
}

/**
 * Applies DFS and return class hierarchy topologically sorted.
 */
function findTopologicalSortOfExtends(
  cls: StructureModelClass
): StructureModelClass[] {
  const visited = new Set<string>();
  const result = [] as StructureModelClass[];
  function visit(cls: StructureModelClass): void {
    visited.add(cls.psmIri);
    for (const ext of cls.extends) {
      if (!visited.has(ext.psmIri)) {
        visit(ext);
      }
    }
    result.push(cls);
  }
  visit(cls);
  return result;
}
