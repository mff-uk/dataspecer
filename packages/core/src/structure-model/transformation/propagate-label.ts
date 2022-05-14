import {ConceptualModel, ConceptualModelProperty,} from "../../conceptual-model";
import {clone} from "../../core";
import {StructureModel} from "../model/base";

/**
 * Add labels from {@link ConceptualModel} if they are missing.
 */
export function propagateLabel(
  conceptual: ConceptualModel,
  structure: StructureModel
): StructureModel {
  const result = clone(structure) as StructureModel;
  const classes = result.getClasses();
  const propertyMap = buildPropertyMap(conceptual);
  for (const classData of classes) {
    const conceptualClass = conceptual.classes[classData.pimIri];
    if (conceptualClass === null || conceptualClass === undefined) {
      continue;
    }
    classData.humanLabel = classData.humanLabel ?? conceptualClass.humanLabel;
    classData.humanDescription =
      classData.humanDescription ?? conceptualClass.humanDescription;
    classData.properties.forEach((property) => {
      const conceptualProperty = propertyMap[property.pimIri];
      property.humanLabel =
        property.humanLabel ?? conceptualProperty?.humanLabel;
      property.humanDescription =
        property.humanDescription ?? conceptualProperty?.humanDescription;
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
