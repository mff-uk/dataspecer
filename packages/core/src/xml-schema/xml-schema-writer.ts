import * as fileSystem from "fs";
import * as path from "path";
import {OutputStream} from "../io/stream/output-stream";

import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexTypeDefinition,
  XmlSchemaElement, XmlSchemaSimpleTypeDefinition, xmlSchemaTypeIsComplex,
  xmlSchemaTypeIsSimple, xmlSchemaComplexContentIsElement,
  xmlSchemaComplexContentIsType, QName,
  langStringName} from "./xml-schema-model";

import {XmlWriter, XmlStreamWriter} from "./xml-writer";

const xsNamespace = "http://www.w3.org/2001/XMLSchema";

export async function saveXmlSchemaToDirectory(
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

  const stream = {
    write: async chunk => {
      outputStream.write(chunk);
    },
  } as OutputStream;
  await writeXmlSchema(model, stream);
  
  outputStream.end();

  return result;
}

export async function writeXmlSchema(
  model: XmlSchema, stream: OutputStream,
): Promise<void> {
  const writer = new XmlStreamWriter(stream);
  await writeSchemaBegin(model, writer);
  await writeImportsAndDefinitions(model, writer);
  await writeElements(model, writer);
  await writeSchemaEnd(writer);
}

async function writeSchemaBegin(
  model: XmlSchema, writer: XmlWriter,
): Promise<void> {
  await writer.writeXmlDeclaration("1.0", "utf-8");
  writer.registerNamespace("xs", xsNamespace);
  await writer.writeElementBegin("xs", "schema");
  await writer.writeNamespaceDeclaration("xs", xsNamespace);
  await writer.writeLocalAttributeValue("version", "1.1");
  if (model.targetNamespace != null) {
    await writer.writeLocalAttributeValue("elementFormDefault", "qualified");
    await writer.writeLocalAttributeValue("targetNamespace", model.targetNamespace);
    if (model.targetNamespacePrefix != null) {
      writer.registerNamespace(model.targetNamespacePrefix, model.targetNamespace);
      await writer.writeNamespaceDeclaration(model.targetNamespacePrefix, model.targetNamespace);
    }
  } else {
    await writer.writeLocalAttributeValue("elementFormDefault", "unqualified");
  }
}

async function writeSchemaEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xs", "schema");
}

async function writeImportsAndDefinitions(
  model: XmlSchema, writer: XmlWriter,
): Promise<void> {
  if (model.defineLangString) {
    await writer.writeElementBegin("xs", "import");
    await writer.writeLocalAttributeValue("namespace", writer.getUriForPrefix("xml"));
    await writer.writeLocalAttributeValue("schemaLocation", "http://www.w3.org/2001/xml.xsd");
    await writer.writeElementEnd("xs", "import");

    await writer.writeElementBegin("xs", "complexType");
    await writer.writeLocalAttributeValue("name", writer.getQName(...langStringName));
    await writer.writeElementBegin("xs", "simpleContent");
    await writer.writeElementBegin("xs", "extension");
    await writer.writeLocalAttributeValue("base", writer.getQName("xs", "string"));
    await writer.writeElementBegin("xs", "attribute");
    await writer.writeLocalAttributeValue("ref", writer.getQName("xml", "lang"));
    await writer.writeLocalAttributeValue("use", "required");
    await writer.writeElementEnd("xs", "attribute");
    await writer.writeElementEnd("xs", "extension");
    await writer.writeElementEnd("xs", "simpleContent");
    await writer.writeElementEnd("xs", "complexType");
  }
}

async function writeElements(
  model: XmlSchema, writer: XmlWriter,
): Promise<void> {
  for (const element of model.elements) {
    await writeElement(element, null, writer);
  }
}

/**
 * Writes out an xs:element definition.
 */
async function writeElement(
  element: XmlSchemaElement,
  parentContent: XmlSchemaComplexContent | null, writer: XmlWriter,
): Promise<void> {
  await writer.writeElementBegin("xs", "element");
  await writer.writeLocalAttributeValue("name", element.elementName);
  await writeAttributesForComplexContent(parentContent, writer);
  const type = element.type;
  if (type.name != null) {
    await writer.writeLocalAttributeValue("type", type.name);
  } else {
    if (xmlSchemaTypeIsComplex(type)) {
      await writeComplexType(type.complexDefinition, writer);
    } else if (xmlSchemaTypeIsSimple(type)) {
      await writeSimpleType(type.simpleDefinition, true, writer);
    }
  }
  await writer.writeElementEnd("xs", "element");
}

/**
 * Writes out an xs:complexType from its definition.
 */
async function writeComplexType(
  definition: XmlSchemaComplexTypeDefinition, writer: XmlWriter,
): Promise<void> {
  await writer.writeElementBegin("xs", "complexType");
  if (definition.mixed) {
    await writer.writeLocalAttributeValue("mixed", "true");
  }
  if (definition.xsType != null) {
    await writeComplexContent(definition, null, false, writer);
  }
  await writer.writeElementEnd("xs", "complexType");
}

/**
 * Writes out attributes shared by elements in an xs:complexType.
 */
async function writeAttributesForComplexContent(
  content: XmlSchemaComplexContent | null, writer: XmlWriter,
): Promise<void> {
  if (content == null) {
    return;
  }
  const cardinality = content.cardinality;
  if (cardinality != null) {
    if (cardinality.min !== 1) {
      await writer.writeLocalAttributeValue(
        "minOccurs", cardinality.min.toString(),
      );
    }
    if (cardinality.max !== 1) {
      await writer.writeLocalAttributeValue(
        "maxOccurs", cardinality.max?.toString() ?? "unbounded",
      );
    }
  }
}

/**
 * Writes out an aggregate element inside an xs:complexType.
 */
async function writeComplexContent(
  definition: XmlSchemaComplexTypeDefinition,
  parentContent: XmlSchemaComplexContent | null, allowCollapse: boolean,
  writer: XmlWriter,
): Promise<void> {
  const contents = definition.contents;
  if (
    contents.length === 1 &&
    (allowCollapse || xmlSchemaComplexContentIsType(contents[0]))
  ) {
    await writeComplexTypes(definition, writer);
  } else {
    await writer.writeElementBegin("xs", definition.xsType);
    await writeAttributesForComplexContent(parentContent, writer);
    await writeComplexTypes(definition, writer);
    await writer.writeElementEnd("xs", definition.xsType);
  }
}

/**
 * Writes out individual members of an xs:complexType element.
 */
async function writeComplexTypes(
  definition: XmlSchemaComplexTypeDefinition, writer: XmlWriter,
): Promise<void> {
  for (const content of definition.contents) {
    if (xmlSchemaComplexContentIsElement(content)) {
      await writeElement(content.element, content, writer);
    }
    if (xmlSchemaComplexContentIsType(content)) {
      await writeComplexContent(content.complexType, content, true, writer);
    }
  }
}

/**
 * Writes out an xs:simpleType from its definition.
 */
async function writeSimpleType(
  definition: XmlSchemaSimpleTypeDefinition, allowCollapse: boolean,
  writer: XmlWriter,
): Promise<void> {
  const contents = definition.contents;
  if (allowCollapse && contents.length === 1) {
    await writer.writeLocalAttributeValue(
      "type", writer.getQName(...contents[0]),
    );
  } else {
    await writer.writeElementBegin("xs", "simpleType");
    if (definition.xsType != null) {
      await writer.writeElementBegin("xs", definition.xsType);
      await writer.writeLocalAttributeValue(
        "memberTypes", contents.map(name => writer.getQName(...name)).join(" "),
      );
      await writer.writeElementEnd("xs", definition.xsType);
    }
    await writer.writeElementEnd("xs", "simpleType");
  }
}
