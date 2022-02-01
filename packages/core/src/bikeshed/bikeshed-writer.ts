import {
  Bikeshed,
  BikeshedContent,
  BikeshedContentList,
  BikeshedContentListItem,
  BikeshedContentSection,
  BikeshedContentText
} from "./bikeshed-model";
import {OutputStream} from "../io/stream/output-stream";
import {st} from "rdflib";

class Context {

  level: number = 1;

  section() {
    const result = new Context();
    result.level = this.level + 1;
    return result;
  }

}

export async function writeBikeshed(model: Bikeshed, stream: OutputStream) {
  await writeMetadata(model, stream);
  await writeContent(model.content, stream, new Context());
}

async function writeMetadata(model: Bikeshed, stream: OutputStream,) {
  await stream.write("<pre class='metadata'>\n");
  for (const [key, value] of Object.entries(model.metadata)) {
    await stream.write(`${key} : ${sanitizeMultiline(value)} \n`);
  }
  await stream.write("</pre>\n");
}

function sanitizeMultiline(string: string | null): string | null {
  if (string === null) {
    return null;
  }
  return string.replace("\n", "\n    ");
}

async function writeContent(
  content: BikeshedContent[],
  stream: OutputStream,
  context: Context,
) {
  for (const item of content) {
    if (item.isText()) {
      await writeText(item, stream, context);
    } else if (item.isList()) {
      await writeList(item, stream, context);
    } else if (item.isSection()) {
      await writeSection(item, stream, context);
    }
  }
}

async function writeText(
  content: BikeshedContentText,
  stream: OutputStream,
  context: Context,
) {
  await stream.write(content.content);
  await stream.write("\n");
}

async function writeList(
  content: BikeshedContentList,
  stream: OutputStream,
  context: Context,
) {
  for (const item of content.items) {
    await stream.write(`: ${item.title}\n`);
    for (const value of item.content) {
      if (value === null) {
        continue;
      }
      await stream.write(`:: ${value}\n`);
    }
  }
}

async function writeSection(
  content: BikeshedContentSection,
  stream: OutputStream,
  context: Context,
) {
  const mark = "#".repeat(context.level);
  if (content.anchor === null) {
    await stream.write(
      `\n${mark} ${content.title}\n`)
  } else {
    await stream.write(
      `\n${mark} ${content.title} ${mark} {#${content.anchor}}\n`)
  }
  await writeContent(content.content, stream, context.section());
}

// async function writeStructureModel(
//   model: DocumentationModelStructure, stream: OutputStream
// ) {
//   await stream.write(
//     `# ${model.humanLabel ?? ""} # {#${model.anchor}}\n` +
//     `${model.humanDescription ?? ""}\n\n`
//   );
//
//   await stream.write("## Struktura\n");
//   for (const entity of model.entities) {
//     await writeStructureEntity(entity, stream);
//   }
//
//   await writeStructureAttachments(model, stream);
// }
//
// async function writeStructureEntity(
//   model: DocumentationModelStructureEntity, stream: OutputStream,
// ) {
//   await stream.write(`${model.humanLabel} {#${model.anchor}}\n-------\n`);
//   await stream.write(`${model.humanDescription ?? ""}\n`)
//   //
//   await stream.write("\n");
//   for (const item of model.properties) {
//     await writeStructureProperty(item, stream);
//   }
// }
//
// async function writeStructureProperty(
//   model: DocumentationModelStructureProperty, stream: OutputStream,
// ) {
//   await stream.write(
//     `### ${model.technicalLabel ?? ""}### {#${model.anchor}}\n`);
//   await writeBikehedPropertyList({
//     "Jméno": `[${model.humanLabel}](#${model.conceptualProperty.anchor})`,
//     "Popis": sanitizeMultiline(model.humanDescription),
//     "Typ": collectStructurePropertyTypes(model)
//   }, stream);
// }
//
// function collectStructurePropertyTypes(
//   model: DocumentationModelStructureProperty
// ): string[] {
//   const result = [];
//   for (const type of model.types) {
//     if (type.isComplex()) {
//       result.push(`[${type.entity.humanLabel ?? ""}](#${type.entity.anchor})`);
//     } else if (type.isPrimitive()) {
//       result.push(`[${type.humanLabel}](${type.typeIri})`);
//     } else {
//       // Ignore.
//     }
//   }
//   return result;
// }
//
// async function writeStructureAttachments(
//   model: DocumentationModelStructure, stream: OutputStream,
// ) {
//   if (model.attachments.length === 0) {
//     return;
//   }
//   await stream.write("## Příklady\n\n");
//   for (const attachment of model.attachments) {
//     await writeStructureAttachment(attachment, stream);
//   }
// }
//
// async function writeStructureAttachment(
//   model: DocumentationModelStructureAttachment, stream: OutputStream,
// ) {
//   await stream.write(`### ${model.humanLabel ?? ""} \n`);
//   if (model.humanDescription !== null) {
//     await stream.write(`${model.humanDescription}\n`);
//   }
//   await stream.write("<pre>\n");
//   await stream.write(model.content);
//   await stream.write("\n</pre>\n");
// }
