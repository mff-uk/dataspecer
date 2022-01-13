import {
  DocumentationAdapterConfiguration,
} from "./documentation-model-adapter";
import {ConceptualModel} from "../../conceptual-model";
import {
  DocumentationModelConceptual,
  DocumentationModelConceptualComplexType,
  DocumentationModelConceptualPrimitiveType,
  DocumentationModelConceptualProperty,
} from "../model";
import {DocumentationModelConceptualEntity} from "../model";
import {assertFailed} from "../../core";

export function conceptualModelToWebSpecification(
  configuration: DocumentationAdapterConfiguration,
  conceptualModel: ConceptualModel
): DocumentationModelConceptual {
  const result = new DocumentationModelConceptual();
  const typesToResolve: [string, DocumentationModelConceptualComplexType][] = [];
  const entitiesMap: Record<string, DocumentationModelConceptualEntity> = {};
  for (const classData of Object.values(conceptualModel.classes)) {
    const entity = new DocumentationModelConceptualEntity();
    entity.humanLabel =
      configuration.selectString(classData.humanLabel);
    entity.humanDescription =
      configuration.selectString(classData.humanDescription);
    entity.cimIri =
      classData.cimIri;
    entity.pimIri =
      classData.pimIri;
    entity.isCodelist =
      classData.isCodelist;
    entity.codelistUrls =
      classData.codelistUrl;
    entity.anchor = configuration.createConceptualClassAnchor(classData);
    result.entities.push(entity);
    entitiesMap[classData.pimIri] = entity;
    for (const propertyData of classData.properties) {
      const property = new DocumentationModelConceptualProperty();
      property.humanLabel =
        configuration.selectString(propertyData.humanLabel);
      property.humanDescription =
        configuration.selectString(propertyData.humanDescription);
      property.cimIri =
        propertyData.cimIri;
      property.pimIri =
        propertyData.pimIri;
      property.anchor = configuration.createConceptualPropertyAnchor(
        classData, propertyData);
      property.cardinalityMin = propertyData.cardinalityMin;
      property.cardinalityMax = propertyData.cardinalityMax;
      entity.properties.push(property);
      // As of now
      for (const typeData of propertyData.dataTypes) {
        if (typeData.isAssociation()) {
          const type = new DocumentationModelConceptualComplexType();
          property.types.push(type);
          // We can not save class now as it may not be available, so we do
          // it later.
          typesToResolve.push([typeData.pimClassIri, type])
        } else if (typeData.isAttribute()) {
          // As of now we do not have the information about primitive
          // types on CIM and so PIM level. This may change in the future.
          const type = new DocumentationModelConceptualPrimitiveType();
          property.types.push(type);
        } else {
          assertFailed("Unexpected property data type.");
        }
      }
    }
  }
  // Set type entities.
  for (const [iri, webType] of typesToResolve) {
    webType.entity = entitiesMap[iri];
  }
  return result;
}
