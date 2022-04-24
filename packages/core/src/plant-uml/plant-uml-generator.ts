import { ArtefactGenerator, ArtefactGeneratorContext } from "../generator";
import {
  DataSpecification,
  DataSpecificationArtefact,
} from "../data-specification/model";
import { StreamDictionary } from "../io/stream/stream-dictionary";
import { PlantUml } from "./plant-uml";
import { MemoryOutputStream } from "../io/stream/memory-output-stream";

export interface PlantUmlGeneratorObject {
  // The generated plantuml code
  data: string;
}

/**
 * Generator that can generate PlantUML source for the given data specification.
 *
 * This generator does not generate the images, only their source.
 */
export class PlantUmlGenerator implements ArtefactGenerator {
  static readonly IDENTIFIER = "plant-uml"; // todo: use IRI

  identifier(): string {
    return PlantUmlGenerator.IDENTIFIER;
  }

  generateForDocumentation(): Promise<unknown | null> {
    throw new Error("Method not implemented.");
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<PlantUmlGeneratorObject | null> {
    const pimSchemaIri = specification.pim;
    const stream = new MemoryOutputStream();
    const plantUml = new PlantUml(context.conceptualModels[pimSchemaIri]);
    await plantUml.write(stream);
    await stream.close();
    return {
      data: stream.getContent(),
    };
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ): Promise<void> {
    const pimSchemaIri = specification.pim;
    const stream = output.writePath(artefact.outputPath);
    const plantUml = new PlantUml(context.conceptualModels[pimSchemaIri]);
    await plantUml.write(stream);
    await stream.close();
  }
}
