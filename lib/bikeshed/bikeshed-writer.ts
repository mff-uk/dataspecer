import * as fileSystem from "fs";
import {WriteStream} from "fs";
import * as path from "path";

import {Bikeshed} from "./bikeshed-model";
import {
  WebSpecificationEntity, WebSpecificationProperty,
  WebSpecificationSchema, WebSpecificationType,
} from "../web-specification/web-specification-model";

export async function writeBikeshed(
  model: Bikeshed, directory: string, name: string,
): Promise<void> {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }

  const outputStream = fileSystem.createWriteStream(
    path.join(directory, name + ".bs"));

  const result = new Promise<void>( (accept, reject) => {
    outputStream.on("close", accept);
    outputStream.on("error", reject);
  });

  writeMetadata(model.metadata, outputStream);
  writeIntroduction(model, outputStream);
  writeDataModel(model.schemas, outputStream);
  outputStream.end();

  return result;
}

function writeMetadata(content: Record<string, string>, stream: WriteStream) {
  stream.write("<pre class='metadata'>\n");
  for (const [key, value] of Object.entries(content)) {
    stream.write(key + ": ");
    stream.write(sanitizeMultiline(value));
    stream.write("\n");
  }
  stream.write("</pre>\n");
}

function asArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  } else {
    return [value];
  }
}

function sanitizeMultiline(string: string): string {
  return string.replace("\n", "\n    ");
}

function writeIntroduction(specification: Bikeshed, stream: WriteStream) {
  stream.write("Introduction {#intro}\n");
  stream.write("=====================\n");
  stream.write(specification.humanDescription);
  stream.write("\n\n");
}

function writeDataModel(specification: WebSpecificationSchema, stream: WriteStream) {
  stream.write("Specifikace\n");
  stream.write("==========\n");
  stream.write(
    "V této sekci jsou definovány jednotlivé třídy a jejich vlastnosti.\n" +
    "Pro každou vlastnost je uveden její identifikátor, který je pro její\n" +
    "reprezentaci použit ve všech datových formátech, její název a datový " +
    "typ.\nVolitelně je uveden také popis a příklad.\n");
  stream.write("\n");
  specification.entities.forEach(entity => writeEntity(entity, stream));
}

function writeEntity(entity: WebSpecificationEntity, stream: WriteStream) {
  stream.write(entity.humanLabel);
  stream.write(" {#" + entity.anchor + "}");
  stream.write("\n-------\n");
  if (isNotEmpty(entity.humanDescription)) {
    stream.write(entity.humanDescription);
    stream.write("\n");
  }
  if (entity.isCodelist) {
    stream.write("Tato třída reprezentuje číselník.\n");
  }
  stream.write("\n");
  //
  entity.properties.forEach((item) => writeProperty(item, stream));
}

function isNotEmpty(string: string | undefined): boolean {
  return string !== undefined && string.trim().length > 0;
}

function writeProperty(property: WebSpecificationProperty, stream: WriteStream) {
  stream.write("### " + property.technicalLabel + "\n");

  stream.write(": Typ");
  property.type.forEach(type => writePropertyType(type, stream));

  if (isNotEmpty(property.humanLabel)) {
    stream.write("\n: Jméno\n");
    stream.write(":: " + sanitizeMultiline(property.humanLabel) + "\n");
  }

  if (isNotEmpty(property.humanDescription)) {
    stream.write("\n: Popis\n");
    stream.write(":: " + sanitizeMultiline(property.humanDescription) + "\n");
  }

  stream.write("\n");

}

function writePropertyType(type: WebSpecificationType, stream: WriteStream) {
  stream.write("\n:: ");
  const link = "[" + type.label + "](" + type.link + ")";
  if (type.codelistIri !== undefined) {
    stream.write("Číselník " + link)
  } else if (type.isClassValue) {
    stream.write("Identifikátor pro " + link)
  } else {
    stream.write(link);
  }
}
