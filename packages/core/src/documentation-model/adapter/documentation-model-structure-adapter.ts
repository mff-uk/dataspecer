import {DocumentationAdapterConfiguration} from "./documentation-model-adapter";
import {StructureModel} from "../../structure-model";
import {
  DocumentationModelConceptual,
  DocumentationModelConceptualEntity,
  DocumentationModelConceptualProperty,
  DocumentationModelStructure,
  DocumentationModelStructureComplexType,
  DocumentationModelStructureEntity,
  DocumentationModelStructurePrimitiveType,
  DocumentationModelStructureProperty,
} from "../model";
import {assert, assertFailed} from "../../core";
import {OFN} from "../../well-known";

export function structureModelToWebSpecificationPsm(
  configuration: DocumentationAdapterConfiguration,
  conceptualWebSpecification: DocumentationModelConceptual,
  structureModel: StructureModel
): DocumentationModelStructure {
  const result = new DocumentationModelStructure();
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
  const typesToResolve: [string, DocumentationModelStructureComplexType][] = [];
  const resultEntityMap: Record<string, DocumentationModelStructureEntity> = {};
  const entityMap: Record<string, DocumentationModelConceptualEntity> =
    buildConceptualEntityMap(conceptualWebSpecification);
  const propertyMap: Record<string, DocumentationModelConceptualProperty> =
    buildConceptualPropertyMap(conceptualWebSpecification);
  for (const classIri of classIris) {
    const classData = structureModel.classes[classIri];
    assert(classData !== null, "Missing class data");
    const entity = new DocumentationModelStructureEntity();
    entity.humanLabel = configuration.selectString(
      classData.humanLabel);
    entity.humanDescription = configuration.selectString(
      classData.humanDescription);
    entity.technicalLabel =
      classData.technicalLabel;
    entity.anchor =
      configuration.createStructureClassAnchor(classData);
    entity.conceptualEntity =
      entityMap[classData.pimIri];
    result.entities.push(entity);
    resultEntityMap[classData.psmIri] = entity;
    for (const propertyData of classData.properties) {
      const property = new DocumentationModelStructureProperty();
      property.humanLabel = configuration.selectString(
        propertyData.humanLabel);
      property.humanDescription = configuration.selectString(
        propertyData.humanDescription);
      property.technicalLabel =
        propertyData.technicalLabel;
      property.conceptualProperty =
        propertyMap[propertyData.pimIri];
      property.anchor =
        configuration.createStructurePropertyAnchor(classData, propertyData);
      property.cardinalityMin = propertyData.cardinalityMin;
      property.cardinalityMax = propertyData.cardinalityMax;
      for (const typeData of propertyData.dataTypes) {
        if (typeData.isAssociation()) {
          const type = new DocumentationModelStructureComplexType();
          property.types.push(type);
          // We can not save class now as it may not be available, so we do
          // it later.
          typesToResolve.push([typeData.psmClassIri, type]);
        } else if (typeData.isAttribute()) {
          const type = new DocumentationModelStructurePrimitiveType();
          type.humanLabel = getPrimitiveTypeHumanLabel(typeData.dataType);
          type.typeIri = typeData.dataType;
          property.types.push(type);
        } else {
          assertFailed("Unexpected property data type.");
        }
      }
      entity.properties.push(property);
    }
  }
  // Set type entities.
  for (const [iri, webType] of typesToResolve) {
    webType.entity = resultEntityMap[iri];
  }
  return result;
}

function buildConceptualEntityMap(specification: DocumentationModelConceptual) {
  const result: Record<string, DocumentationModelConceptualEntity> = {};
  for (const entity of specification.entities) {
    result[entity.pimIri] = entity;
  }
  return result;
}

function buildConceptualPropertyMap(specification: DocumentationModelConceptual) {
  const result: Record<string, DocumentationModelConceptualProperty> = {};
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
