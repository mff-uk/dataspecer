import {ConceptualModel} from "../../conceptual-model";
import {StructureModel} from "../model";
import {assert, clone} from "../../core";
import {buildPropertyMap} from "../../conceptual-model/utils";

/**
 * Adds information whether the association is reversed or not.
 * @param conceptual
 * @param structure
 */
export function propagateReverse(
  conceptual: ConceptualModel,
  structure: StructureModel
): StructureModel {
  const result = clone(structure) as StructureModel;
  const classes = result.getClasses();
  const propertyMap = buildPropertyMap(conceptual);

  // Process properties
  for (const structureClass of classes) {
    const conceptualClass = conceptual.classes[structureClass.pimIri];

    structureClass.properties.forEach(
      property => {
        // Class and property must be interpreted
        if (!conceptualClass || !property.pimIri) {
          property.isReverse = false;
          return;
        }

        const conceptualProperty = propertyMap[property.pimIri];
        assert(!!conceptualProperty, `propagateReverse: Conceptual property ${property.pimIri} should exists.`);
        property.isReverse = conceptualProperty.isReverse;
      }
    );
  }

  return result;
}
