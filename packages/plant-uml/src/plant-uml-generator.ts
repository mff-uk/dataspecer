import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import {
  DataSpecification,
  DataSpecificationArtefact,
} from "@dataspecer/core/data-specification/model";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { PlantUml } from "./plant-uml.ts";
import { MemoryOutputStream } from "@dataspecer/core/io/stream/memory-output-stream";
import { filterByStructural } from "@dataspecer/core/conceptual-model/transformation/filter-by-structural";

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

  async generateForDocumentation(): Promise<unknown | null> {
    return null
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<PlantUmlGeneratorObject | null> {
    const pimSchemaIri = specification.pim;
    const stream = new MemoryOutputStream();
    let conceptualModel = context.conceptualModels[pimSchemaIri];
    const structureModels = specification.psms.map(psm => context.structureModels[psm]);
    conceptualModel = filterByStructural(conceptualModel, structureModels);
    const plantUml = new PlantUml(conceptualModel);
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
    let conceptualModel = context.conceptualModels[pimSchemaIri];
    const structureModels = specification.psms.map(psm => context.structureModels[psm]);
    conceptualModel = filterByStructural(conceptualModel, structureModels);
    const plantUml = new PlantUml(conceptualModel);
    await plantUml.write(stream);
    await stream.close();
  }
}
