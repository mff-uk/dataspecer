import {
  StructureModelClass,
  StructureModelPrimitiveType,
  StructureModelProperty,
  StructureModel,
  StructureModelType, StructureModelComplexType,
} from "../structure-model";
import {
  XmlSchema,
  XmlSchemaComplexContentElement,
  XmlSchemaComplexContentType,
  XmlSchemaComplexType,
  XmlSchemaComplexTypeDefinition,
  XmlSchemaElement,
  XmlSchemaSimpleType,
  XmlSchemaType,
} from "./xml-schema-model";
import {OFN} from "../well-known";

type ClassMap = Record<string, StructureModelClass>;

export function objectModelToXmlSchema(schema: StructureModel): XmlSchema {
  const classMap: ClassMap = collectClassMap(schema);
  return {
    "targetNamespace": null,
    "elements": schema.roots
      .map(iri => classMap[iri])
      .map(classData => classToElement(classMap, classData)),
  };
}

function collectClassMap(schema: StructureModel): ClassMap {
  const result: ClassMap = {};
  for (const classData of Object.values(schema.classes)) {
    result[classData.psmIri] = classData;
  }
  return result;
}

function classToElement(
  classMap: ClassMap,
  classData: StructureModelClass
): XmlSchemaElement {
  return {
    "elementName": classData.technicalLabel,
    "type": {
      "name": null,
      "complexDefinition": classToComplexType(classMap, classData),
    } as XmlSchemaComplexType,
  };
}

function classToComplexType(
  classMap: ClassMap,
  classData: StructureModelClass,
): XmlSchemaComplexTypeDefinition {
  return {
    "mixed": false,
    "xsType": "sequence",
    "contents": classData.properties.map(
      property => propertyToComplexContent(classMap, property)
    ),
  };
}

function propertyToComplexContent(
  classMap: ClassMap,
  propertyData: StructureModelProperty,
): XmlSchemaComplexContentElement {
  return {
    "cardinality": {
      "min": propertyData.cardinalityMin,
      "max": propertyData.cardinalityMax,
    },
    "element": propertyToElement(classMap, propertyData),
  };
}

function propertyToElement(
  classMap: ClassMap,
  propertyData: StructureModelProperty,
): XmlSchemaElement {
  let dataTypes = propertyData.dataTypes;
  if (dataTypes.length === 0) {
    throw new Error(`Property ${propertyData.psmIri} has no specified types.`);
  }
  // Treat codelists as URIs
  dataTypes = dataTypes.map(type => replaceCodelistWithUri(classMap, type));
  // Enforce the same type (class or datatype)
  // for all types in the property range.
  const result =
    propertyToElementCheckType(
      propertyData,
      dataTypes,
      type => type.isAssociation(),
      types => classPropertyToComplexType(classMap, types as any))
    ??
    propertyToElementCheckType(
      propertyData,
      dataTypes,
      type => type.isAttribute(),
      datatypePropertyToSimpleType);
  if (result == null) {
    throw new Error(
      `Property ${propertyData.psmIri} must use either only `
      + "class types or only primitive types.",
    );
  }
  return result;
}

const anyUriType: StructureModelPrimitiveType = (function()
{
  const type = new StructureModelPrimitiveType();
  type.dataType = "http://www.w3.org/2001/XMLSchema#anyURI";
  return type;
})();

function replaceCodelistWithUri(
  classMap: ClassMap,
  dataType: StructureModelType
): StructureModelType {
  if (dataType.isAssociation() && classMap[dataType.psmClassIri].isCodelist) {
    return anyUriType;
  }
  return dataType;
}

function propertyToElementCheckType(
  propertyData: StructureModelProperty,
  dataTypes: StructureModelType[],
  rangeChecker: (rangeType: StructureModelType) => boolean,
  typeConstructor: (dataTypes: StructureModelType[]) => XmlSchemaType,
): XmlSchemaElement | null {
  if (dataTypes.every(rangeChecker)) {
    return {
      "elementName": propertyData.technicalLabel,
      "type": typeConstructor(dataTypes),
    };
  }
  return null;
}

function classPropertyToComplexType(
  classMap: ClassMap,
  dataTypes: StructureModelComplexType[],
): XmlSchemaComplexType {
  return {
    "name": null,
    "complexDefinition": {
      "mixed": false,
      "xsType": "choice",
      "contents": dataTypes
        .map(dataType => classMap[dataType.psmClassIri])
        .map(classData => classToComplexContent(classMap, classData))
    },
  };
}

function datatypePropertyToSimpleType(
  dataTypes: StructureModelPrimitiveType[],
): XmlSchemaSimpleType {
  return {
    "name": null,
    "simpleDefinition": {
      "xsType": "union",
      "contents": dataTypes.map(primitiveToQName),
    },
  };
}

function classToComplexContent(
  classMap: ClassMap,
  classData: StructureModelClass,
): XmlSchemaComplexContentType {
  return {
    "complexType": classToComplexType(classMap, classData),
    "cardinality": null,
  };
}

/**
 * Temporary map from datatype URIs to QNames, if needed.
 */
const simpleTypeMap: Record<string, [prefix: string, localName: string]> = {};

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

function primitiveToQName(
  primitiveData: StructureModelPrimitiveType,
): [prefix: string, localName: string] {
  if (primitiveData.dataType == null) {
    return ["xs", "anySimpleType"];
  }
  return primitiveData.dataType.startsWith(xsdNamespace) ?
    ["xs", primitiveData.dataType.substring(xsdNamespace.length)] :
    simpleTypeMap[primitiveData.dataType];
}
