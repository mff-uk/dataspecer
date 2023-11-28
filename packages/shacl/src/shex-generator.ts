import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {DataSpecification, DataSpecificationArtefact,} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary.js";


export class ShexGenerator implements ArtefactGenerator {
  static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/shex";

  identifier(): string {
    return ShexGenerator.IDENTIFIER;
  }

  generateForDocumentation(): Promise<unknown | null> {
    return Promise.resolve(null); // Null means no documentation is necessary
    //throw new Error("Method not implemented.");
  }

  async generateToObject(): Promise<null> {
    return Promise.resolve(null);
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ): Promise<void> {
    if (!artefact.outputPath) {
      throw new Error("No output path specified.");
    }

    const stream = output.writePath(artefact.outputPath);
    await stream.write("hello");
    await stream.close();
  }
}
