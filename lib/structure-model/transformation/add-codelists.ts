import {ConceptualModel} from "../../conceptual-model";
import {StructureModel, StructureModelClass} from "../model";

/**
 * Add codelist information from {@link ConceptualModel}.
 */
export function structureModelAddCodelists(
  conceptual: ConceptualModel,
  structure: StructureModel
): StructureModel {
  const result = {...structure, "classes": {}} as StructureModel;
  for (const [iri, structureClass] of Object.entries(structure.classes)) {
    const classData = {...structureClass} as StructureModelClass;
    result.classes[iri] = classData;
    const conceptualClass = conceptual.classes[classData.pimIri];
    if (conceptualClass === null) {
      continue;
    }
    classData.isCodelist = conceptualClass.isCodelist;
    classData.codelistUrl = [...(conceptualClass.codelistUrl ?? [])];
  }
  return result;
}
