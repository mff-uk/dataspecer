import * as fileSystem from "fs";
import * as path from "path";

import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexTypeDefinition,
  XmlSchemaElement, XmlSchemaSimpleTypeDefinition,
  xmlSchemaTypeIsComplex, xmlSchemaTypeIsSimple,
  xmlSchemaComplexContentIsElement, xmlSchemaComplexContentIsType} from "./xml-schema-model";

import {XmlWriter, XmlWriteStreamWriter} from "./xml-writer";

const xsNamespace = "http://www.w3.org/2001/XMLSchema";

export async function writeXmlSchema(
  model: XmlSchema, directory: string, name: string,
): Promise<void> {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }

  const outputStream = fileSystem.createWriteStream(
    path.join(directory, name + ".xsd"));

  const result = new Promise<void>( (accept, reject) => {
    outputStream.on("close", accept);
    outputStream.on("error", reject);
  });

  const writer = new XmlWriteStreamWriter(outputStream);
  writeSchemaBegin(writer);
  writeElements(model, writer);
  writeSchemaEnd(writer);
  outputStream.end();

  return result;
}

function writeSchemaBegin(writer: XmlWriter) {
  writer.writeXmlDeclaration("1.0", "utf-8");
  writer.registerNamespace("xs", xsNamespace);
  writer.writeElementBegin("xs", "schema");
  writer.writeNamespaceDeclaration("xs", xsNamespace);
  writer.writeLocalAttributeValue("elementFormDefault", "unqualified");
  writer.writeLocalAttributeValue("version", "1.1");
}

function writeSchemaEnd(writer: XmlWriter) {
  writer.writeElementEnd("xs", "schema");
}

function writeElements(model: XmlSchema, writer: XmlWriter) {
  for (const element of model.elements) {
    writeElement(element, null, writer);
  }
}

function writeElement(element: XmlSchemaElement, parentContent: XmlSchemaComplexContent | null, writer: XmlWriter) {
  writer.writeElementBegin("xs", "element");
  writer.writeLocalAttributeValue("name", element.elementName);
  writeAttributesForComplexContent(parentContent, writer);
  const type = element.type;
  if (type != null) {
    writer.writeLocalAttributeValue("type", type.name);
  } else {
    if (xmlSchemaTypeIsComplex(type)) {
      writeComplexType(type.complexDefinition, writer);
    } else if (xmlSchemaTypeIsSimple(type)) {
      writeSimpleType(type.simpleDefinition, writer);
    }
    writer.writeElementEnd("xs", "element");
  }
}

function writeComplexType(definition: XmlSchemaComplexTypeDefinition, writer: XmlWriter) {
  writer.writeElementBegin("xs", "complexType");
  if (definition.mixed) {
    writer.writeLocalAttributeValue("mixed", "true");
  }
  if (definition.xsType != null) {
    writeComplexContent(definition, null, writer);
  }
  writer.writeElementEnd("xs", "complexType");
}

function writeAttributesForComplexContent(content: XmlSchemaComplexContent | null, writer: XmlWriter) {
  if (content != null) {
    return;
  }
  const cardinality = content.cardinality;
  if (cardinality != null) {
    if (cardinality.min !== 1) {
      writer.writeLocalAttributeValue("minOccurs", cardinality.min.toString());
    }
    if (cardinality.max !== 1) {
      writer.writeLocalAttributeValue("maxOccurs", cardinality.max?.toString() ?? "unbounded");
    }
  }
}

function writeComplexContent(definition: XmlSchemaComplexTypeDefinition, parentContent: XmlSchemaComplexContent | null, writer: XmlWriter) {
  writer.writeElementBegin("xs", definition.xsType);
  writeAttributesForComplexContent(parentContent, writer);
  writeComplexTypes(definition, writer);
  writer.writeElementEnd("xs", definition.xsType);
}

function writeComplexTypes(definition: XmlSchemaComplexTypeDefinition, writer: XmlWriter) {
  for (const content of definition.contents) {
    if (xmlSchemaComplexContentIsElement(content)) {
      writeElement(content.element, content, writer);
    }
    if (xmlSchemaComplexContentIsType(content)) {
      writeComplexContent(content.complexType, content, writer);
    }
  }
}

function writeSimpleType(definition: XmlSchemaSimpleTypeDefinition, writer: XmlWriter) {
  writer.writeElementBegin("xs", "simpleType");
  if (definition.xsType != null) {
    writer.writeElementBegin("xs", definition.xsType);
    writer.writeLocalAttributeValue("memberTypes", definition.contents.join(" "));
    writer.writeElementEnd("xs", definition.xsType);
  }
  writer.writeElementEnd("xs", "simpleType");
}
