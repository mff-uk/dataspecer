import * as fileSystem from "fs";
import * as path from "path";

import {Bikeshed} from "./bikeshed-model";
import {
  WebSpecificationEntity, WebSpecificationProperty,
  WebSpecificationSchema, WebSpecificationType,
} from "../web-specification/web-specification-model";
import {Writable} from "../io/stream/writable";

export async function saveBikeshed(
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

  // wrap outputStream into a Writable object
  const writable = {
    write: chunk =>
      new Promise<void>((resolve, reject) => {
        outputStream.write(chunk, error => error ? reject(error) : resolve());
      }),
  } as Writable;

  await writeBikeshed(model, writable);
  outputStream.end();

  return result;
}

export async function writeBikeshed(model: Bikeshed, writable: Writable): Promise<void> {
  await writeMetadata(model.metadata, writable);
  await writeIntroduction(model, writable);
  await writeDataModel(model.schemas, writable);
}

async function writeMetadata(content: Record<string, string>, writable: Writable) {
  await writable.write("<pre class='metadata'>\n");
  for (const [key, value] of Object.entries(content)) {
    await writable.write(key + ": ");
    await writable.write(sanitizeMultiline(value));
    await writable.write("\n");
  }
  await writable.write("</pre>\n");
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

async function writeIntroduction(specification: Bikeshed, writable: Writable) {
  await writable.write("Introduction {#intro}\n");
  await writable.write("=====================\n");
  await writable.write(specification.humanDescription);
  await writable.write("\n\n");
}

async function writeDataModel(specification: WebSpecificationSchema, writable: Writable) {
  await writable.write("Specifikace\n");
  await writable.write("==========\n");
  await writable.write(
    "V této sekci jsou definovány jednotlivé třídy a jejich vlastnosti.\n" +
    "Pro každou vlastnost je uveden její identifikátor, který je pro její\n" +
    "reprezentaci použit ve všech datových formátech, její název a datový " +
    "typ.\nVolitelně je uveden také popis a příklad.\n");
  await writable.write("\n");
  for (const entity of specification.entities) {
    await writeEntity(entity, writable);
  }
}

async function writeEntity(entity: WebSpecificationEntity, writable: Writable) {
  await writable.write(entity.humanLabel);
  await writable.write(" {#" + entity.anchor + "}");
  await writable.write("\n-------\n");
  if (isNotEmpty(entity.humanDescription)) {
    await writable.write(entity.humanDescription);
    await writable.write("\n");
  }
  if (entity.isCodelist) {
    await writable.write("Tato třída reprezentuje číselník.\n");
  }
  await writable.write("\n");
  //
  for (const item of entity.properties) {
    await writeProperty(item, writable);
  }
}

function isNotEmpty(string: string | undefined): boolean {
  return string !== undefined && string.trim().length > 0;
}

async function writeProperty(property: WebSpecificationProperty, writable: Writable) {
  await writable.write("### " + property.technicalLabel + "\n");

  await writable.write(": Typ");
  for (const type of property.type) {
    await writePropertyType(type, writable);
  }

  if (isNotEmpty(property.humanLabel)) {
    await writable.write("\n: Jméno\n");
    await writable.write(":: " + sanitizeMultiline(property.humanLabel) + "\n");
  }

  if (isNotEmpty(property.humanDescription)) {
    await writable.write("\n: Popis\n");
    await writable.write(":: " + sanitizeMultiline(property.humanDescription) + "\n");
  }

  await writable.write("\n");

}

async function writePropertyType(type: WebSpecificationType, writer: Writable) {
  await writer.write("\n:: ");
  const link = "[" + type.label + "](" + type.link + ")";
  if (type.codelistIri !== undefined) {
    await writer.write("Číselník " + link);
  } else if (type.isClassValue) {
    await writer.write("Identifikátor pro " + link);
  } else {
    await writer.write(link);
  }
}
