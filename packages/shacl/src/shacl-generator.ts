import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary.js";
import {assertFailed, assertNot} from "@dataspecer/core/core";
import {transformStructureModel} from "@dataspecer/core/structure-model/transformation";
import {ShaclAdapter} from "./shacl-adapter.js";

interface ShaclGeneratorObject {
  data: string;
}

export class ShaclGenerator implements ArtefactGenerator {
  static readonly IDENTIFIER = "https://schemas.dataspecer.com/generator/shacl";

  identifier(): string {
    return ShaclGenerator.IDENTIFIER;
  }

  generateForDocumentation(): Promise<unknown | null> {
    throw new Error("Method not implemented.");
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<ShaclGeneratorObject | null> {
    if (!DataSpecificationSchema.is(artefact)) {
      assertFailed("Invalid artefact type.");
    }
    const schemaArtefact = artefact as DataSpecificationSchema;
    const conceptualModel = context.conceptualModels[specification.pim];
    assertNot(
        conceptualModel === undefined,
        `Missing conceptual model ${specification.pim}.`
    );
    let model = context.structureModels[schemaArtefact.psm];
    assertNot(
        model === undefined,
        `Missing structure model ${schemaArtefact.psm}.`
    );

    model = Object.values(context.conceptualModels).reduce(
        (model, conceptualModel) => transformStructureModel(conceptualModel, model, Object.values(context.specifications)),
        model
    );

    // todo use model, context, artefact to create the result
    //return {data: "# SHACL artifact\n"};
    const adapter = new ShaclAdapter(model, context, artefact);
    return adapter.generate();
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ): Promise<void> {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await stream.write(model.data);
    await stream.close();
  }
}
