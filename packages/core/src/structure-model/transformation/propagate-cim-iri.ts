import { ConceptualModel } from "../../conceptual-model";
import { buildPropertyMap } from "../../conceptual-model/utils";
import { clone } from "../../core";
import { StructureModel } from "../model";

/**
 * Adds CIM iris from {@link ConceptualModel} to {@link StructureModel}.
 * @param conceptual
 * @param structure
 */
export function propagateCimIri(
    conceptual: ConceptualModel,
    structure: StructureModel
): StructureModel {
    const result = clone(structure) as StructureModel;
    const classes = result.getClasses();
    const propertyMap = buildPropertyMap(conceptual);

    // Process classes and extend classes
    for (const classData of classes) {
        const conceptualClass = conceptual.classes[classData.pimIri];
        if (conceptualClass === null || conceptualClass === undefined) {
            continue;
        }
        classData.cimIri = conceptualClass.cimIri;
        classData.iris = conceptualClass.iris;
    }

    // Process properties
    for (const structureClass of classes) {
        structureClass.properties.forEach(
            property => {
                let conceptualProperty = propertyMap(property.pimIri, property.isReverse);
                if (conceptualProperty) {
                    property.cimIri = conceptualProperty.cimIri;
                    property.iris = conceptualProperty.iris;
                }
            }
        );
    }

    return result;
}
