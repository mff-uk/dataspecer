import {Bikeshed} from "./bikeshed-model";
import {
  DocumentationModelConceptual,
  DocumentationModelConceptualEntity,
  DocumentationModelConceptualProperty,
  DocumentationModelStructure,
  DocumentationModelStructureEntity, 
  DocumentationModelStructureProperty,
  DocumentationModelStructureAttachment

} from "../documentation-model";
import {OutputStream} from "../io/stream/output-stream";

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
  model: DocumentationModelConceptual, stream: OutputStream
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
  model: DocumentationModelConceptualEntity, stream: OutputStream,
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
  model: DocumentationModelConceptualProperty, stream: OutputStream,
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
  model: DocumentationModelStructure, stream: OutputStream
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
  model: DocumentationModelStructureEntity, stream: OutputStream,
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
  model: DocumentationModelStructureProperty, stream: OutputStream,
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
  model: DocumentationModelStructureProperty
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
  model: DocumentationModelStructure, stream: OutputStream,
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
  model: DocumentationModelStructureAttachment, stream: OutputStream,
) {
  await stream.write(`### ${model.humanLabel ?? ""} \n`);
  await stream.write(`${model.humanDescription}\n`);
  await stream.write("<pre>\n");
  await stream.write(model.content);
  await stream.write("\n</pre>\n");
}