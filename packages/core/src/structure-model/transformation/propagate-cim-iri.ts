import {ConceptualModel, ConceptualModelProperty} from "../../conceptual-model";
import {StructureModel} from "../model";
import {clone} from "../../core";

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
                // Find the correct class that contains the given property
                let conceptualProperty: ConceptualModelProperty|null = null;
                for (const cls of Object.values(conceptual.classes)) {
                    const found = cls.properties
                        .find(p => p.pimIri === property.pimIri);
                    if (found) {
                        conceptualProperty = found;
                        break;
                    }
                }

                if (conceptualProperty) {
                    property.cimIri = conceptualProperty.cimIri;
                    property.iris = conceptualProperty.iris;
                }
            }
        );
    }

    return result;
}
