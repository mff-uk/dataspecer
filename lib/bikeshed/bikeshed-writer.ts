import * as fileSystem from "fs";
import * as path from "path";

import {Bikeshed} from "./bikeshed-model";
import {
  WebSpecificationEntity, WebSpecificationProperty,
  WebSpecificationSchema, WebSpecificationType,
} from "../web-specification";
import {OutputStream} from "../io/stream/output-stream";

export async function saveBikeshedToDirectory(
  model: Bikeshed, directory: string, name: string,
): Promise<void> {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }

  const outputStream = fileSystem.createWriteStream(
    path.join(directory, name + ".bs"));

  const result = new Promise<void>((accept, reject) => {
    outputStream.on("close", accept);
    outputStream.on("error", reject);
  });

  const stream = {
    write: async chunk => {
      await outputStream.write(chunk);
    },
  } as OutputStream;

  await writeBikeshed(model, stream);
  outputStream.end();

  return result;
}

export async function writeBikeshed(
  model: Bikeshed, stream: OutputStream,
): Promise<void> {
  await writeMetadata(model.metadata, stream);
  await writeIntroduction(model, stream);
  await writeDataModel(model.schemas, stream);
}

async function writeMetadata(
  content: Record<string, string>, stream: OutputStream,
) {
  await stream.write("<pre class='metadata'>\n");
  for (const [key, value] of Object.entries(content)) {
    await stream.write(key + ": ");
    await stream.write(sanitizeMultiline(value));
    await stream.write("\n");
  }
  await stream.write("</pre>\n");
}

function sanitizeMultiline(string: string): string {
  return string.replace("\n", "\n    ");
}

async function writeIntroduction(
  specification: Bikeshed, stream: OutputStream,
) {
  await stream.write("Introduction {#intro}\n=====================\n");
  await stream.write(specification.humanDescription);
  await stream.write("\n\n");
}

async function writeDataModel(
  specification: WebSpecificationSchema, stream: OutputStream,
) {
  await stream.write("Specifikace\n==========\n" +
    "V této sekci jsou definovány jednotlivé třídy a jejich vlastnosti.\n" +
    "Pro každou vlastnost je uveden její identifikátor, který je pro její\n" +
    "reprezentaci použit ve všech datových formátech, její název a datový " +
    "typ.\nVolitelně je uveden také popis a příklad.\n");
  await stream.write("\n");
  for (const entity of specification.entities) {
    await writeEntity(entity, stream);
  }
}

async function writeEntity(
  entity: WebSpecificationEntity, stream: OutputStream,
) {
  await stream.write(entity.humanLabel);
  await stream.write(" {#" + entity.anchor + "}\n-------\n");
  if (isNotEmpty(entity.humanDescription)) {
    await stream.write(entity.humanDescription);
    await stream.write("\n");
  }
  if (entity.isCodelist) {
    await stream.write("Tato třída reprezentuje číselník.\n");
  }
  await stream.write("\n");
  for (const item of entity.properties) {
    await writeProperty(item, stream);
  }
}

function isNotEmpty(string: string | undefined): boolean {
  return string !== undefined && string.trim().length > 0;
}

async function writeProperty(
  property: WebSpecificationProperty, stream: OutputStream,
) {
  await stream.write("### " + property.technicalLabel + "\n");

  await stream.write(": Typ");
  for (const type of property.type) {
    await writePropertyType(type, stream);
  }

  if (isNotEmpty(property.humanLabel)) {
    await stream.write(
      "\n: Jméno\n:: " + sanitizeMultiline(property.humanLabel) + "\n");
  }

  if (isNotEmpty(property.humanDescription)) {
    await stream.write(
      "\n: Popis\n:: " + sanitizeMultiline(property.humanDescription) + "\n");
  }

  await stream.write("\n");

}

async function writePropertyType(
  type: WebSpecificationType, writer: OutputStream,
) {
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
