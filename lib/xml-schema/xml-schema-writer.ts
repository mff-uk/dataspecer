import * as fileSystem from "fs";
import {WriteStream} from "fs";
import * as path from "path";

import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexTypeDefinition,
  XmlSchemaElement, XmlSchemaSimpleTypeDefinition,
  xmlSchemaTypeIsComplex, xmlSchemaTypeIsSimple,
  xmlSchemaComplexContentIsElement, xmlSchemaComplexContentIsType} from "./xml-schema-model";

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

  const context = new WriterContext(0, 2);
  writeSchemaHeader(outputStream, context);
  writeElements(model, outputStream, context.indent());
  writeSchemaFooter(outputStream, context);
  outputStream.end();

  return result;
}

class WriterContext {
  indentLevel: number;
  lineStart: string;
  indentTabs: number;

  constructor(indentLevel: number, indentTabs: number) {
    this.indentLevel = indentLevel;
    this.lineStart = "  ".repeat(this.indentLevel);
    this.indentTabs = indentTabs;
  }

  indent(): WriterContext {
    return new WriterContext(this.indentLevel + this.indentTabs, this.indentTabs);
  }
}

function xmlEscape(text: string): string {
  return text.replace(/[&<>"']/g, function(m) {
    return `&#${m.charCodeAt(0)};`
  });
}

function writeSchemaHeader(stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}<?xml version="1.0" encoding="utf-8"?>\n`);
  stream.write(`${context.lineStart}<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified" version="1.1">\n`);
}

function writeSchemaFooter(stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}</xs:schema>\n`);
}

function writeElements(model: XmlSchema, stream: WriteStream, context: WriterContext) {
  for (const element of model.elements) {
    writeElement(element, null, stream, context);
  }
}

function writeElement(element: XmlSchemaElement, parentContent: XmlSchemaComplexContent | null, stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}<xs:element name="${xmlEscape(element.elementName)}"`);
  writeAttributesForComplexContent(parentContent, stream);
  const type = element.type;
  if (type != null) {
    stream.write(` type="${xmlEscape(type.name)}"/>\n`);
  } else {
    stream.write(">\n");
    if (xmlSchemaTypeIsComplex(type)) {
      writeComplexType(type.complexDefinition, stream, context.indent());
    } else if (xmlSchemaTypeIsSimple(type)) {
      writeSimpleType(type.simpleDefinition, stream, context.indent());
    }
    stream.write(`${context.lineStart}</xs:element>\n`);
  }
}

function writeComplexType(definition: XmlSchemaComplexTypeDefinition, stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}<xs:complexType`);
  if (definition.mixed) {
    stream.write(" mixed=\"true\"");
  }
  stream.write(">\n");
  if (definition.xsType != null) {
    writeComplexContent(definition, null, stream, context.indent());
  }
  stream.write(`${context.lineStart}</xs:complexType>\n`);
}

function writeAttributesForComplexContent(content: XmlSchemaComplexContent | null, stream: WriteStream) {
  if (content != null) {
    return;
  }
  const cardinality = content.cardinality;
  if (cardinality != null) {
    if (cardinality.min !== 1) {
      stream.write(` minOccurs="${cardinality.min}"`);
    }
    if (cardinality.max !== 1) {
      stream.write(` maxOccurs="${cardinality.max ?? "unbounded"}"`);
    }
  }
}

function writeComplexContent(definition: XmlSchemaComplexTypeDefinition, parentContent: XmlSchemaComplexContent | null, stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}<xs:${definition.xsType}`);
  writeAttributesForComplexContent(parentContent, stream);
  stream.write(">\n");
  writeComplexTypes(definition, stream, context.indent());
  stream.write(`${context.lineStart}</xs:${definition.xsType}>\n`);
}

function writeComplexTypes(definition: XmlSchemaComplexTypeDefinition, stream: WriteStream, context: WriterContext) {
  for (const content of definition.contents) {
    if (xmlSchemaComplexContentIsElement(content)) {
      writeElement(content.element, content, stream, context.indent());
    }
    if (xmlSchemaComplexContentIsType(content)) {
      writeComplexContent(content.complexType, content, stream, context.indent());
    }
  }
}

function writeSimpleType(definition: XmlSchemaSimpleTypeDefinition, stream: WriteStream, context: WriterContext) {
  stream.write(`${context.lineStart}<xs:simpleType>\n`);
  if (definition.xsType != null) {
    stream.write(`${context.indent().lineStart}<xs:${definition.xsType} memberTypes="${xmlEscape(definition.contents.join(" "))}"/>\n`);
  }
  stream.write(`${context.lineStart}</xs:simpleType>\n`);
}
