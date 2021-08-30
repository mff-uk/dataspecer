import {ObjectModelClass, ObjectModelPrimitive, ObjectModelProperty, ObjectModelSchema, isObjectModelClass, isObjectModelPrimitive} from "../object-model/object-model";
import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexType, XmlSchemaElement, XmlSchemaSimpleType} from "./xml-schema-model";

export function schemaAsXmlSchema(schema: ObjectModelSchema): XmlSchema {
  const result = new XmlSchema();
  result.elements = Object.values(schema.roots).map(classElement);
  return result;
}

function classElement(cls: ObjectModelClass): XmlSchemaElement {
  const result = new XmlSchemaElement();
  result.elementName = cls.technicalLabel;
  result.type = {
    complexDefinition: classType(cls)
  }
  return result;
}

function classType(cls: ObjectModelClass): XmlSchemaComplexType {
  return {
    mixed: false,
    xsType: "sequence",
    contents: Object.values(cls.properties).map(propertyContent)
  };
}

function propertyContent(prop: ObjectModelProperty): XmlSchemaComplexContent {
  return {
    cardinality: prop.cardinality,
    element: propertyElement(prop)
  };
}

function propertyElement(prop: ObjectModelProperty): XmlSchemaElement {
  const result = new XmlSchemaElement();
  result.elementName = prop.technicalLabel;
  if (prop.dataTypes.length == 0) {
    throw new Error(`Property ${prop.psmIri} has no specified types.`);
  }
  if (isObjectModelClass(prop.dataTypes[0])) {
    // all must be class
    if (!prop.dataTypes.every(isObjectModelClass)) {
      throw new Error(`Property ${prop.psmIri} must use only class types.`);
    }
    result.type.complexDefinition = {
      mixed: false,
      xsType: "choice",
      contents: Object.values(prop.dataTypes).map(classContent)
    };
  }
  if (isObjectModelPrimitive(prop.dataTypes[0])) {
    // all must be primitive
    if (!prop.dataTypes.every(isObjectModelPrimitive)) {
      throw new Error(`Property ${prop.psmIri} must use only primitive types.`);
    }
    result.type.simpleDefinition = {
      xsType: "union",
      contents: Object.values(prop.dataTypes).map(primitiveContent)
    };
  }
  return result;
}

function classContent(cls: ObjectModelClass): XmlSchemaComplexContent {
  return {
    complexType: classType(cls)
  }
}

const simpleTypeMap: Record<string, string> = {

};

const xsdNamespace = "http://www.w3.org/2001/XMLSchema#";

function primitiveContent(cls: ObjectModelPrimitive): string {
  return cls.dataType.startsWith(xsdNamespace) ?
    "xs:" + cls.dataType.substr(xsdNamespace.length) :
    simpleTypeMap[cls.dataType];
}
