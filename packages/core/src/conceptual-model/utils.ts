import {ConceptualModel, ConceptualModelProperty} from "./model";

/**
 * Returns all the properties from the conceptual model as a map indexed by
 * PIM iri.
 * @param conceptual Conceptual model
 */
export function buildPropertyMap(conceptual: ConceptualModel) {
  const result: Record<string, ConceptualModelProperty> = {};
  for (const entity of Object.values(conceptual.classes)) {
    for (const property of entity.properties) {
      result[property.pimIri] = property;
    }
  }
  return result;
}
