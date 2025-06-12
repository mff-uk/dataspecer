import pako from "pako";
import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {DataSpecification, DataSpecificationArtefact} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import { PlantUmlGenerator, PlantUmlGeneratorObject } from "@dataspecer/plant-uml";

/**
 * Generates PlantUml images from the given data specification.
 *
 * The code uses plantuml.com api and therefore is not in core package.
 */
export class PlantUmlImageGenerator implements ArtefactGenerator {
  static readonly IDENTIFIER = PlantUmlGenerator.IDENTIFIER + "/image";

  identifier(): string {
    return PlantUmlImageGenerator.IDENTIFIER;
  }

  async generateForDocumentation(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    documentationIdentifier: string,
    callerContext: unknown,
  ): Promise<unknown | null> {
    return null;
  }

  generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
  ): Promise<unknown | null> {
    throw new Error("Method not implemented.");
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary,
  ): Promise<void> {
    const plantUmlGenerator = await context.createGenerator(PlantUmlGenerator.IDENTIFIER);
    if (!plantUmlGenerator) {
      throw new Error("Could not find PlantUmlGenerator.");
    }
    const plantUmlObject = await plantUmlGenerator.generateToObject(
      context, artefact, specification
    ) as PlantUmlGeneratorObject;

    const resultImage = await this.generateFromSource(plantUmlObject.data);

    if (resultImage) {
      const stream = output.writePath(artefact.outputPath as string);
      // @ts-ignore
      await stream.write(resultImage);
      await stream.close();
    }
  }

  private async generateFromSource(source: string): Promise<Blob | null> {
    const deflate = pako.deflateRaw(
      decodeURIComponent(encodeURIComponent(source))
    );
    const base64String = encode64(deflate);

    try {
      const result = await fetch(`https://www.plantuml.com/plantuml/svg/${base64String}`);

      if (result.status !== 200) {
        console.warn(`Unable to generate PlantUML image: ${result.status}.`);
        return null;
      }

      return result.blob();
    } catch (error) {
      console.warn(`Unable to generate PlantUML image due to network error.`);
      console.error(error);
    }

    return null;
  }
}


/**
 * This code is from https://plantuml.com/
 */
function encode64(data: Uint8Array): string {
  let r = "";
  for (let i=0; i < data.length; i += 3) {
    if (i+2 === data.length) {
      r +=append3bytes(data[i]!, data[i+1]!, 0);
    } else if (i+1 === data.length) {
      r += append3bytes(data[i]!, 0, 0);
    } else {
      r += append3bytes(data[i]!, data[i+1]!, data[i+2]!);
    }
  }
  return r;
}

/**
 * This code is from https://plantuml.com/
 */
function append3bytes(b1: number, b2: number, b3: number) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  let r = "";
  r += encode6bit(c1 & 0x3F);
  r += encode6bit(c2 & 0x3F);
  r += encode6bit(c3 & 0x3F);
  r += encode6bit(c4 & 0x3F);
  return r;
}

/**
 * This code is from https://plantuml.com/
 */
function encode6bit(b: number) {
  if (b < 10) {
    return String.fromCharCode(48 + b);
  }
  b -= 10;
  if (b < 26) {
    return String.fromCharCode(65 + b);
  }
  b -= 26;
  if (b < 26) {
    return String.fromCharCode(97 + b);
  }
  b -= 26;
  if (b === 0) {
    return '-';
  }
  if (b === 1) {
    return '_';
  }
  return '?';
}
