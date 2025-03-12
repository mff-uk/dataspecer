import {ConceptualModel, ConceptualModelPrimitiveType} from "../../conceptual-model";
import {StructureModel} from "../model";
import {clone} from "../../core";
import {buildPropertyMap} from "../../conceptual-model/utils";

/**
 * Add regex from {@link ConceptualModel} if they are missing.
 */
export function propagateLanguageStringRequiredLanguages(
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
    classData.properties.forEach(property => {
      const conceptualProperty = propertyMap(property.pimIri, property.isReverse);
      if (conceptualProperty) {
        for (const dataType of property.dataTypes) {
          if (dataType.isAttribute()) {
            dataType.languageStringRequiredLanguages = (conceptualProperty.dataTypes[0] as ConceptualModelPrimitiveType)?.languageStringRequiredLanguages ?? [];
          }
        }
      }

    });
  }
  return result;
}
