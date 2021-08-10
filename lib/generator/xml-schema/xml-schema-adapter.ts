import {ClassData, PropertyData, PropertyType, SchemaData} from "../../entity-model/entity-model";
import {XmlSchema, XmlSchemaComplexType, XmlSchemaElement} from "./xml-schema-model";

export function schemaAsXmlSchema(schema: SchemaData): XmlSchema {
  const result = new XmlSchema();
  result.elements = Object.values(schema.roots).map(classElement);
  return result;
}

function classElement(cls: ClassData): XmlSchemaElement
{
  const result = new XmlSchemaElement();
  result.name = cls.technicalLabel;
  result.type = {
    name: undefined,
    definition: classContent(cls)
  }
  return result;
}

function classContent(cls: ClassData): XmlSchemaComplexType
{
  return {
    mixed: false,
    type: "xs:all",
    contents: Object.values(cls.properties).map(propertyElement)
  };
}

const simpleTypeMap: Record<string, string> = {

};

const xsdNamespace = 'http://www.w3.org/2001/XMLSchema#';

function propertyElement(prop: PropertyData) : XmlSchemaElement
{
  const result = new XmlSchemaElement();
  result.name = prop.technicalLabel;
  switch(prop.propertyType) {
    case PropertyType.Attribute:
      result.type.name = prop.dataTypePrimitive.startsWith(xsdNamespace) ?
        'xs:' + prop.dataTypePrimitive.substr(xsdNamespace.length) :
        simpleTypeMap[prop.dataTypePrimitive];
      break;
    case PropertyType.Association:
      result.type.definition = {
        mixed: false,
        type: "xs:choice",
        contents: Object.values(prop.dataTypeClass).map(classElement)
      }
      break;
  }
  return result;
}
