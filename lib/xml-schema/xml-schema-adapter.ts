import {ObjectModelClass, ObjectModelPrimitive, ObjectModelProperty,
  ObjectModelSchema, isObjectModelClass, isObjectModelPrimitive} from "../object-model/object-model";
import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexType, XmlSchemaElement, XmlSchemaSimpleType} from "./xml-schema-model";

export function objectModelSchemaToXmlSchema(schema: ObjectModelSchema): XmlSchema {
  return {
    "targetNamespace": null,
    "elements": Object.values(schema.roots).map(classToElement)
  };
}

function classToElement(classData: ObjectModelClass): XmlSchemaElement {
  return {
    "elementName": classData.technicalLabel,
    "type": {
      "name": null,
      "complexDefinition": classToComplexType(classData),
      "simpleDefinition": undefined
    }
  };
}

function classToComplexType(classData: ObjectModelClass): XmlSchemaComplexType {
  return {
    "mixed": false,
    "xsType": "sequence",
    "contents": Object.values(classData.properties).map(propertyToComplexContent)
  };
}

function propertyToComplexContent(propertyData: ObjectModelProperty): XmlSchemaComplexContent {
  return {
    "cardinality": propertyData.cardinality,
    "element": propertyToElement(propertyData),
    "complexType": undefined
  };
}

function propertyToElement(propertyData: ObjectModelProperty): XmlSchemaElement {
  if (propertyData.dataTypes.length === 0) {
    throw new Error(`Property ${propertyData.psmIri} has no specified types.`);
  }
  // enforce the same type (class or datatype) for all types in the property range
  if (isObjectModelClass(propertyData.dataTypes[0])) {
    // all must be class
    if (propertyData.dataTypes.every(isObjectModelClass)) {
      return {
        "elementName": propertyData.technicalLabel,
        "type": {
          "name": null,
          "complexDefinition": classPropertyToComplexType(propertyData),
          "simpleDefinition": undefined
        }
      }
    }
  }
  else if (isObjectModelPrimitive(propertyData.dataTypes[0])) {
    // all must be primitive
    if (propertyData.dataTypes.every(isObjectModelPrimitive)) {
      return {
        "elementName": propertyData.technicalLabel,
        "type": {
          "name": null,
          "complexDefinition": undefined,
          "simpleDefinition": datatypePropertyToSimpleType(propertyData)
        }
      }
    }
  }
  throw new Error(`Property ${propertyData.psmIri} must use either only class types or only primitive types.`);
}

function classPropertyToComplexType(propertyData: ObjectModelProperty): XmlSchemaComplexType {
  return {
    "mixed": false,
    "xsType": "choice",
    "contents": Object.values(propertyData.dataTypes).map(classToComplexContent)
  };
}

function datatypePropertyToSimpleType(propertyData: ObjectModelProperty): XmlSchemaSimpleType {
  return {
    "xsType": "union",
    "contents": Object.values(propertyData.dataTypes).map(primitiveToQName)
  };
}

function classToComplexContent(classData: ObjectModelClass): XmlSchemaComplexContent {
  return {
    "complexType": classToComplexType(classData),
    "element": null,
    "cardinality": null
  }
}

// temporary map from datatype URIs to QNames, if needed
const simpleTypeMap: Record<string, string> = {

};

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

function primitiveToQName(primitiveData: ObjectModelPrimitive): string {
  return primitiveData.dataType.startsWith(xsdNamespace) ?
    "xs:" + primitiveData.dataType.substr(xsdNamespace.length) :
    simpleTypeMap[primitiveData.dataType];
}
