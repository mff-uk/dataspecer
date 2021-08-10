import * as fileSystem from "fs";
import {WriteStream} from "fs";
import * as path from "path";

import {XmlSchema, XmlSchemaElement} from "./xml-schema-model";

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

  writeSchemaHeader(outputStream);
  for (const elem of model.elements) {
    writeElement(elem, outputStream);
  }
  writeSchemaFooter(outputStream);
  outputStream.end();

  return result;
}

function xmlEscape(text: string): string {
  // TODO
  return text;
}

function writeSchemaHeader(stream: WriteStream) {
  stream.write('<?xml version="1.0" encoding="utf-8"?>\n');
  stream.write('<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="unqualified" version="1.0">\n');
}

function writeSchemaFooter(stream: WriteStream) {
  stream.write('</xs:schema>\n');
}

function writeElement(elem: XmlSchemaElement, stream: WriteStream) {
  stream.write(`<xs:element name="${xmlEscape(elem.name)}"`);
  const type = elem.type;
  if (type.definition == undefined) {
    stream.write(` type="${xmlEscape(type.name)}"/>\n`);
  } else {
    stream.write('>\n');
    stream.write(`<xs:complexType`);
    const def = type.definition;
    if (def.mixed) {
      stream.write(' mixed="true"');
    }
    if (type.name != undefined) {
      stream.write(` name="${xmlEscape(type.name)}">\n`);
    } else {
      stream.write('>\n');
    }
    if (def.type != undefined) {
      stream.write(`<${def.type}>\n`);
      for (const cntElem of def.contents) {
        writeElement(cntElem, stream);
      }
      stream.write(`</${def.type}>\n`);
    }
    stream.write(`</xs:complexType>\n`);
  }
  stream.write('</xs:element>\n');
}
