import { StructureModel } from "../model";
import { DataSpecification } from "../../data-specification/model";

/**
 * For each class set the owner specification.
 */
export function addDataSpecification(
  structure: StructureModel,
  specifications: DataSpecification[]
): StructureModel {
  const schemaToSpecification = buildSchemaToSpecificationMap(specifications);
  const result = {
    ...structure,
    classes: {},
    specification: schemaToSpecification[structure.psmIri] ?? null,
  } as StructureModel;
  for (const [iri, classData] of Object.entries(structure.classes)) {
    result.classes[iri] = {
      ...classData,
      specification: schemaToSpecification[classData.structureSchema] ?? null,
    };
  }
  return result;
}

function buildSchemaToSpecificationMap(specifications: DataSpecification[]): {
  [schema: string]: string;
} {
  const result = {};
  for (const specification of specifications) {
    for (const iri of specification.psms) {
      result[iri] = specification.iri;
    }
  }
  return result;
}
