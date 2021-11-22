import {ModelsToWebSpecificationConfiguration} from "./web-specification-adapter";
import {StructureModel} from "../../structure-model";
import {
  WebSpecificationConceptual,
  WebSpecificationConceptualEntity,
  WebSpecificationConceptualProperty,
  WebSpecificationStructure,
  WebSpecificationStructureComplexType,
  WebSpecificationStructureEntity,
  WebSpecificationStructurePrimitiveType,
  WebSpecificationStructureProperty,
} from "../model";
import {assert, assertFailed} from "../../core";
import {OFN} from "../../well-known";

export function structureModelToWebSpecificationPsm(
  configuration: ModelsToWebSpecificationConfiguration,
  conceptualWebSpecification: WebSpecificationConceptual,
  structureModel: StructureModel
): WebSpecificationStructure {
  const result = new WebSpecificationStructure();
  result.humanLabel = configuration.selectString(
    structureModel.humanLabel);
  result.humanDescription = configuration.selectString(
    structureModel.humanDescription);
  result.anchor = configuration.createStructureAnchor(structureModel);
  // Put roots first then the rest.
  const classIris = [...structureModel.roots];
  for (const iri of Object.keys(structureModel.classes)) {
    if (classIris.includes(iri)) {
      continue;
    }
    classIris.push(iri);
  }
  const typesToResolve: [string, WebSpecificationStructureComplexType][] = [];
  const resultEntityMap: Record<string, WebSpecificationStructureEntity> = {};
  const entityMap: Record<string, WebSpecificationConceptualEntity> =
    buildConceptualEntityMap(conceptualWebSpecification);
  const propertyMap: Record<string, WebSpecificationConceptualProperty> =
    buildConceptualPropertyMap(conceptualWebSpecification);
  for (const classIri of classIris) {
    const classData = structureModel.classes[classIri];
    assert(classData !== null, "Missing class data");
    const webEntity = new WebSpecificationStructureEntity();
    webEntity.humanLabel = configuration.selectString(
      classData.humanLabel);
    webEntity.humanDescription = configuration.selectString(
      classData.humanDescription);
    webEntity.technicalLabel =
      classData.technicalLabel;
    webEntity.anchor =
      configuration.createStructureClassAnchor(classData);
    webEntity.conceptualEntity =
      entityMap[classData.pimIri];
    result.entities.push(webEntity);
    resultEntityMap[classData.psmIri] = webEntity;
    for (const propertyData of classData.properties) {
      const webProperty = new WebSpecificationStructureProperty();
      webProperty.humanLabel = configuration.selectString(
        propertyData.humanLabel);
      webProperty.humanDescription = configuration.selectString(
        propertyData.humanDescription);
      webProperty.technicalLabel =
        propertyData.technicalLabel;
      webProperty.conceptualProperty =
        propertyMap[propertyData.pimIri];
      webProperty.anchor =
        configuration.createStructurePropertyAnchor(classData, propertyData);
      for (const typeData of propertyData.dataTypes) {
        let webType;
        if (typeData.isAssociation()) {
          webType = new WebSpecificationStructureComplexType();
          // We can not save class now as it may not be available, so we do
          // it later.
          typesToResolve.push([typeData.psmClassIri, webType]);
        } else if (typeData.isAttribute()) {
          webType = new WebSpecificationStructurePrimitiveType();
          webType.humanLabel = getPrimitiveTypeHumanLabel(typeData.dataType);
          webType.typeIri = typeData.dataType;
        } else {
          assertFailed("Unexpected property data type.");
        }
        webProperty.types.push(webType);
      }
      webEntity.properties.push(webProperty);
    }
  }
  // Set type entities.
  for (const [iri, webType] of typesToResolve) {
    webType.entity = resultEntityMap[iri];
  }
  return result;
}

function buildConceptualEntityMap(specification: WebSpecificationConceptual) {
  const result: Record<string, WebSpecificationConceptualEntity> = {};
  for (const entity of specification.entities) {
    result[entity.pimIri] = entity;
  }
  return result;
}

function buildConceptualPropertyMap(specification: WebSpecificationConceptual) {
  const result: Record<string, WebSpecificationConceptualProperty> = {};
  for (const entity of specification.entities) {
    for (const property of entity.properties) {
      result[property.pimIri] = property;
    }
  }
  return result;
}

function getPrimitiveTypeHumanLabel(iri: string): string {
  return OFN[iri] ?? iri;
}
