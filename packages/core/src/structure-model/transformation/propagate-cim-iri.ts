import {ConceptualModel, ConceptualModelProperty} from "../../conceptual-model";
import {StructureModel, StructureModelClass} from "../model";

/**
 * Adds CIM iris from {@link ConceptualModel} to {@link StructureModel}.
 * @param conceptual
 * @param structure
 */
export function propagateCimIri(
    conceptual: ConceptualModel,
    structure: StructureModel
): StructureModel {
    const result = { ...structure, classes: {} } as StructureModel;

    // Process classes
    for (const [iri, structureClass] of Object.entries(structure.classes)) {
        const classData = { ...structureClass } as StructureModelClass;
        result.classes[iri] = classData;
        const conceptualClass = conceptual.classes[classData.pimIri];
        if (conceptualClass === null || conceptualClass === undefined) {
            continue;
        }
        classData.cimIri = conceptualClass.cimIri;
    }

    // Update extend classes
    for (const structureClass of Object.values(result.classes)) {
        structureClass.extends = structureClass.extends.map(
            cls => result.classes[cls.psmIri] ?? cls
        );
    }

    // Process properties
    for (const structureClass of Object.values(result.classes)) {
        structureClass.properties = structureClass.properties.map(
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
                    return {
                        ...property,
                        cimIri: conceptualProperty.cimIri
                    };
                } else {
                    return property;
                }
            }
        );
    }

    return result;
}
