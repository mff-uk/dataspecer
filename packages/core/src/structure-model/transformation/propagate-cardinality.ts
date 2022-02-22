import {
  ConceptualModel,
  ConceptualModelProperty,
} from "../../conceptual-model";
import { StructureModel, StructureModelClass } from "../model";

/**
 * Add cardinalities from {@link ConceptualModel} if they are missing.
 */
export function propagateCardinality(
  conceptual: ConceptualModel,
  structure: StructureModel
): StructureModel {
  const result = { ...structure, classes: {} } as StructureModel;
  const propertyMap = buildPropertyMap(conceptual);
  for (const [iri, structureClass] of Object.entries(structure.classes)) {
    const classData = { ...structureClass } as StructureModelClass;
    result.classes[iri] = classData;
    const conceptualClass = conceptual.classes[classData.pimIri];
    if (conceptualClass === null || conceptualClass === undefined) {
      continue;
    }
    classData.properties = classData.properties.map((property) => {
      const conceptualProperty = propertyMap[property.pimIri];
      return {
        ...property,
        cardinalityMin:
          property.cardinalityMin ?? conceptualProperty.cardinalityMin,
        cardinalityMax:
          property.cardinalityMax ?? conceptualProperty.cardinalityMax,
      };
    });
  }
  return result;
}

function buildPropertyMap(conceptual: ConceptualModel) {
  const result: Record<string, ConceptualModelProperty> = {};
  for (const entity of Object.values(conceptual.classes)) {
    for (const property of entity.properties) {
      result[property.pimIri] = property;
    }
  }
  return result;
}
