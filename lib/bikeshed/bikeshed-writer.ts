import * as fileSystem from "fs";
import * as path from "path";

import {Bikeshed} from "./bikeshed-model";
import {
  WebSpecificationConceptual,
  WebSpecificationConceptualEntity,
  WebSpecificationConceptualProperty,
  WebSpecificationStructure,
  WebSpecificationStructureEntity, WebSpecificationStructureProperty

} from "../web-specification";
import {OutputStream} from "../io/stream/output-stream";
import {WebSpecificationStructureAttachment} from "../web-specification/model/web-specification-structure-attachment";

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
  await writeConceptualModel(model.conceptual, stream);
  for (const structure of model.structures) {
    await writeStructureModel(structure, stream);
  }
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

function sanitizeMultiline(string: string | null): string | null {
  if (string === null) {
    return null;
  }
  return string.replace("\n", "\n    ");
}

async function writeIntroduction(
  model: Bikeshed, stream: OutputStream,
) {
  await stream.write("# Úvod # {#introduction}\n");
  await stream.write(model.humanDescription ?? "");
  await stream.write("\n\n");
}

async function writeConceptualModel(
  model: WebSpecificationConceptual, stream: OutputStream
) {
  await stream.write(
    "# Konceptuální model # {#konceptuální-model}\n" +
    "V této sekci je definován konceptuální model.\n\n"
  );

  await stream.write("## Struktura\n");

  for (const entity of model.entities) {
    await writeConceptualEntity(entity, stream);
  }
}

async function writeConceptualEntity(
  model: WebSpecificationConceptualEntity, stream: OutputStream,
) {
  await stream.write(`### ${model.humanLabel ?? ""} ### {#${model.anchor}}\n`);
  await stream.write(`${model.humanDescription ?? ""}\n`)
  if (model.isCodelist) {
    await stream.write("Tato třída reprezentuje číselník.\n");
  }
  await stream.write("\n");
  for (const item of model.properties) {
    await writeConceptualProperty(item, stream);
  }
}

async function writeConceptualProperty(
  model: WebSpecificationConceptualProperty, stream: OutputStream,
) {
  await stream.write(
    `#### ${model.humanLabel ?? ""} #### {#${model.anchor}}\n`);
  await writePropertyList({
    "Popis": sanitizeMultiline(model.humanDescription),
  }, stream);
  await stream.write("\n");
}

async function writePropertyList(
  properties: Record<string, null | string | (string | null)[]>,
  stream: OutputStream
) {
  for (const [key, item] of Object.entries(properties)) {
    let values = asArray(item);
    if (values.length === 0) {
      continue;
    }
    await stream.write(`: ${key}\n`);
    for (const value of values) {
      await stream.write(`:: ${value}\n`);
    }
  }
}

function asArray<T>(values: T | null | (T | null) []): T[] {
  let result = [];
  if (Array.isArray(values)) {
    result = values;
  } else {
    result = [values];
  }
  return result.filter(item => item !== null)

}

async function writeStructureModel(
  model: WebSpecificationStructure, stream: OutputStream
) {
  await stream.write(
    `# ${model.humanLabel ?? ""} # {#${model.anchor}}\n` +
    `${model.humanDescription ?? ""}\n\n`
  );

  await stream.write("## Struktura\n");
  for (const entity of model.entities) {
    await writeStructureEntity(entity, stream);
  }

  await writeStructureAttachments(model, stream);
}

async function writeStructureEntity(
  model: WebSpecificationStructureEntity, stream: OutputStream,
) {
  await stream.write(`${model.humanLabel} {#${model.anchor}}\n-------\n`);
  await stream.write(`${model.humanDescription ?? ""}\n`)
  //
  await stream.write("\n");
  for (const item of model.properties) {
    await writeStructureProperty(item, stream);
  }
}

async function writeStructureProperty(
  model: WebSpecificationStructureProperty, stream: OutputStream,
) {
  await stream.write(
    `### ${model.technicalLabel ?? ""}### {#${model.anchor}}\n`);
  await writePropertyList({
    "Jméno": `[${model.humanLabel}](#${model.conceptualProperty.anchor})`,
    "Popis": sanitizeMultiline(model.humanDescription),
    "Typ": collectStructurePropertyTypes(model)
  }, stream);
  await stream.write("\n");
}

function collectStructurePropertyTypes(
  model: WebSpecificationStructureProperty
): string[] {
  const result = [];
  for (const type of model.types) {
    if (type.isComplex()) {
      result.push(`[${type.entity.humanLabel ?? ""}](#${type.entity.anchor})`);
    } else if (type.isPrimitive()) {
      result.push(`[${type.humanLabel}](${type.typeIri})`);
    } else {
      // Ignore.
    }
  }
  return result;
}

async function writeStructureAttachments(
  model: WebSpecificationStructure, stream: OutputStream,
) {
  if (model.attachments.length === 0) {
    return;
  }
  await stream.write("## Příklady\n\n");
  for (const attachment of model.attachments) {
    await writeStructureAttachment(attachment, stream);
  }
}


async function writeStructureAttachment(
  model: WebSpecificationStructureAttachment, stream: OutputStream,
) {
  await stream.write(`### ${model.humanLabel ?? ""} \n`);
  await stream.write(`${model.humanDescription}\n`);
  await stream.write("<pre>\n");
  await stream.write(model.content);
  await stream.write("\n</pre>\n");
}