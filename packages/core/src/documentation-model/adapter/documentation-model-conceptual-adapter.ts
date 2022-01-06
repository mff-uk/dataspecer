import {
  ModelsToWebSpecificationConfiguration,
} from "./documentation-model-adapter";
import {ConceptualModel} from "../../conceptual-model";
import {
  DocumentationModelConceptual,
  WebSpecificationConceptualComplexType,
  WebSpecificationConceptualPrimitiveType,
  DocumentationModelConceptualProperty,
} from "../model";
import {DocumentationModelConceptualEntity} from "../model";
import {assertFailed} from "../../core";

export function conceptualModelToWebSpecification(
  configuration: ModelsToWebSpecificationConfiguration,
  conceptualModel: ConceptualModel
): DocumentationModelConceptual {
  const result = new DocumentationModelConceptual();
  const typesToResolve: [string, WebSpecificationConceptualComplexType][] = [];
  const entitiesMap: Record<string, DocumentationModelConceptualEntity> = {};
  for (const classData of Object.values(conceptualModel.classes)) {
    const webEntity = new DocumentationModelConceptualEntity();
    webEntity.humanLabel =
      configuration.selectString(classData.humanLabel);
    webEntity.humanDescription =
      configuration.selectString(classData.humanDescription);
    webEntity.cimIri =
      classData.cimIri;
    webEntity.pimIri =
      classData.pimIri;
    webEntity.isCodelist =
      classData.isCodelist;
    webEntity.codelistUrls =
      classData.codelistUrl;
    webEntity.anchor = configuration.createConceptualClassAnchor(classData);
    result.entities.push(webEntity);
    entitiesMap[classData.pimIri] = webEntity;
    for (const propertyData of classData.properties) {
      const webProperty = new DocumentationModelConceptualProperty();
      webProperty.humanLabel =
        configuration.selectString(propertyData.humanLabel);
      webProperty.humanDescription =
        configuration.selectString(propertyData.humanDescription);
      webProperty.cimIri =
        propertyData.cimIri;
      webProperty.pimIri =
        propertyData.pimIri;
      webProperty.anchor = configuration.createConceptualPropertyAnchor(
        classData, propertyData);
      webEntity.properties.push(webProperty);
      // As of now
      for (const typeData of propertyData.dataTypes) {
        let webType;
        if (typeData.isAssociation()) {
          webType = new WebSpecificationConceptualComplexType();
          // We can not save class now as it may not be available, so we do
          // it later.
          typesToResolve.push([typeData.pimClassIri, webType])
        } else if (typeData.isAttribute()) {
          // As of now we do not have the information about primitive
          // types on CIM and so PIM level. This may change in the future.
          webType = new WebSpecificationConceptualPrimitiveType();
        } else {
          assertFailed("Unexpected property data type.");
        }
        webProperty.types.push(webType);
      }
    }
  }
  // Set type entities.
  for (const [iri, webType] of typesToResolve) {
    webType.entity = entitiesMap[iri];
  }
  return result;
}
