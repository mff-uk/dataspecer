import * as fileSystem from "fs";
import {WriteStream} from "fs";
import * as path from "path";

import {XmlSchema, XmlSchemaComplexContent, XmlSchemaComplexType, XmlSchemaElement, XmlSchemaSimpleType, XmlSchemaType} from "./xml-schema-model";

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

  var ctx = new WriterContext(0, 2);
  writeSchemaHeader(outputStream, ctx);
  writeElements(model, outputStream, ctx.indent());
  writeSchemaFooter(outputStream, ctx);
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

function writeSchemaHeader(stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}<?xml version="1.0" encoding="utf-8"?>\n`);
  stream.write(`${ctx.lineStart}<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified" version="1.1">\n`);
}

function writeSchemaFooter(stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}</xs:schema>\n`);
}

function writeElements(model: XmlSchema, stream: WriteStream, ctx: WriterContext) {
  for (const elem of model.elements) {
    writeElement(elem, null, stream, ctx);
  }
}

function writeElement(elem: XmlSchemaElement, cnt: XmlSchemaComplexContent, stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}<xs:element name="${xmlEscape(elem.elementName)}"`);
  writeComplexContentAttributes(cnt, stream);
  const type = elem.type;
  if (type != null) {
    stream.write(` type="${xmlEscape(type.name)}"/>\n`);
  } else {
    stream.write(">\n");
    if (type.complexDefinition != null) {
      writeComplexType(type.complexDefinition, stream, ctx.indent());
    } else if (type.simpleDefinition != null) {
      writeSimpleType(type.simpleDefinition, stream, ctx.indent());
    }
    stream.write(`${ctx.lineStart}</xs:element>\n`);
  }
}

function writeComplexType(def: XmlSchemaComplexType, stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}<xs:complexType`);
  if (def.mixed) {
    stream.write(` mixed="true"`);
  }
  stream.write(">\n");
  if (def.xsType != null) {
    writeComplexContent(def, null, stream, ctx.indent());
  }
  stream.write(`${ctx.lineStart}</xs:complexType>\n`);
}

function writeComplexContentAttributes(cnt: XmlSchemaComplexContent, stream: WriteStream) {
  if (cnt != null) return;
  var card = cnt.cardinality;
  if (card != null) {
    if (card.min != 1) {
      stream.write(` minOccurs="${card.min}"`);
    }
    if (card.max != 1) {
      stream.write(` maxOccurs="${card.max ?? "unbounded"}"`);
    }
  }
}

function writeComplexContent(def: XmlSchemaComplexType, cnt: XmlSchemaComplexContent, stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}<xs:${def.xsType}`);
  writeComplexContentAttributes(cnt, stream);
  stream.write(">\n");
  writeComplexTypes(def, stream, ctx.indent());
  stream.write(`${ctx.lineStart}</xs:${def.xsType}>\n`);
}

function writeComplexTypes(def: XmlSchemaComplexType, stream: WriteStream, ctx: WriterContext) {
  for (const cnt of def.contents) {
    if (cnt.element != null) {
      writeElement(cnt.element, cnt, stream, ctx.indent());
    }
    if (cnt.complexType != null) {
      writeComplexContent(cnt.complexType, cnt, stream, ctx.indent());
    }
  }
}

function writeSimpleType(def: XmlSchemaSimpleType, stream: WriteStream, ctx: WriterContext) {
  stream.write(`${ctx.lineStart}<xs:simpleType>\n`);
  if (def.xsType != null) {
    stream.write(`${ctx.indent().lineStart}<xs:${def.xsType} memberTypes="${xmlEscape(def.contents.join(" "))}"/>\n`);
  }
  stream.write(`${ctx.lineStart}</xs:simpleType>\n`);
}
