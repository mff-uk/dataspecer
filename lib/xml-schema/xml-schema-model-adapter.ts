import {ObjectModelClass, ObjectModelPrimitive, ObjectModelProperty,
  ObjectModelSchema, isObjectModelClass, isObjectModelPrimitive}
  from "../object-model/object-model";
import {XmlSchema, XmlSchemaComplexTypeDefinition, XmlSchemaElement,
  XmlSchemaComplexType, XmlSchemaSimpleType, XmlSchemaType,
  XmlSchemaComplexContentType, XmlSchemaComplexContentElement}
  from "./xml-schema-model";

export function objectModelToXmlSchema(schema: ObjectModelSchema): XmlSchema {
  return {
    "targetNamespace": null,
    "elements": Object.values(schema.roots).map(classToElement),
  };
}

function classToElement(classData: ObjectModelClass): XmlSchemaElement {
  return {
    "elementName": classData.technicalLabel,
    "type": {
      "name": null,
      "complexDefinition": classToComplexType(classData),
    } as XmlSchemaComplexType,
  };
}

function classToComplexType(
  classData: ObjectModelClass,
): XmlSchemaComplexTypeDefinition {
  return {
    "mixed": false,
    "xsType": "sequence",
    "contents":
      Object.values(classData.properties).map(propertyToComplexContent),
  };
}

function propertyToComplexContent(
  propertyData: ObjectModelProperty,
): XmlSchemaComplexContentElement {
  return {
    "cardinality": propertyData.cardinality,
    "element": propertyToElement(propertyData),
  };
}

function propertyToElement(
  propertyData: ObjectModelProperty,
): XmlSchemaElement {
  if (propertyData.dataTypes.length === 0) {
    throw new Error(`Property ${propertyData.psmIri} has no specified types.`);
  }
  // Enforce the same type (class or datatype)
  // for all types in the property range.
  const result =
    propertyToElementCheckType(
      propertyData, isObjectModelClass, classPropertyToComplexType,
    ) ?? propertyToElementCheckType(
      propertyData, isObjectModelPrimitive, datatypePropertyToSimpleType,
    );
  if (result == null) {
    throw new Error(
      `Property ${propertyData.psmIri} must use either only `
      + "class types or only primitive types.",
    );
  }
  return result;
}

function propertyToElementCheckType(
  propertyData: ObjectModelProperty,
  rangeChecker: (rangeType: ObjectModelClass | ObjectModelPrimitive) => boolean,
  typeConstructor: (propertyData: ObjectModelProperty) => XmlSchemaType,
): XmlSchemaElement | null {
  if (rangeChecker(propertyData.dataTypes[0])) {
    if (propertyData.dataTypes.every(rangeChecker)) {
      return {
        "elementName": propertyData.technicalLabel,
        "type": typeConstructor(propertyData),
      };
    }
  }
  return null;
}

function classPropertyToComplexType(
  propertyData: ObjectModelProperty,
): XmlSchemaComplexType {
  return {
    "name": null,
    "complexDefinition": {
      "mixed": false,
      "xsType": "choice",
      "contents":
        Object.values(propertyData.dataTypes).map(classToComplexContent),
    },
  };
}

function datatypePropertyToSimpleType(
  propertyData: ObjectModelProperty,
): XmlSchemaSimpleType {
  return {
    "name": null,
    "simpleDefinition": {
      "xsType": "union",
      "contents": Object.values(propertyData.dataTypes).map(primitiveToQName),
    },
  };
}

function classToComplexContent(
  classData: ObjectModelClass,
): XmlSchemaComplexContentType {
  return {
    "complexType": classToComplexType(classData),
    "cardinality": null,
  };
}

/**
 * Temporary map from datatype URIs to QNames, if needed.
 */
const simpleTypeMap: Record<string, [prefix: string, localName: string]> = {

};

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

function primitiveToQName(
  primitiveData: ObjectModelPrimitive,
): [prefix: string, localName: string] {
  if (primitiveData.dataType == null) {
    return ["xs", "anySimpleType"];
  }
  return primitiveData.dataType.startsWith(xsdNamespace) ?
    ["xs", primitiveData.dataType.substring(xsdNamespace.length)] :
    simpleTypeMap[primitiveData.dataType];
}
