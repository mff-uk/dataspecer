import {ConceptualModel,} from "../../conceptual-model";
import {StructureModel} from "../model";
import {assert, clone} from "../../core";
import {buildPropertyMap} from "../../conceptual-model/utils";

/**
 * Add cardinalities from {@link ConceptualModel} if they are missing.
 */
export function propagateCardinality(
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
      const conceptualProperty = propertyMap[property.pimIri];
      assert(!!conceptualProperty, `propagateCardinality: Conceptual property ${property.pimIri} should exists.`)
      property.cardinalityMin =
        property.cardinalityMin ?? conceptualProperty.cardinalityMin;
      property.cardinalityMax =
        property.cardinalityMax ?? conceptualProperty.cardinalityMax
    });
  }
  return result;
}
