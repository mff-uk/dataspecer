import {ArtefactGenerator, ArtefactGeneratorContext} from "@dataspecer/core/generator";
import {DataSpecification, DataSpecificationArtefact, DataSpecificationSchema} from "@dataspecer/core/data-specification/model";
import {assertFailed, assertNot} from "@dataspecer/core/core";
import {transformStructureModel} from "@dataspecer/core/structure-model/transformation";
import {JsonLdAdapter} from "./json-ld-adapter";
import {writeJsonLd} from "./json-ld-writer";
import {StreamDictionary} from "@dataspecer/core/io/stream/stream-dictionary";
import {structureModelAddJsonProperties} from "../json-structure-model/add-json-properties";

export const JSON_LD_GENERATOR = "http://dataspecer.com/generator/json-ld"

export class JsonLdGenerator implements ArtefactGenerator {
  identifier(): string {
    return JSON_LD_GENERATOR;
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await writeJsonLd(model, stream);
    await stream.close();
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<object> {
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
    // model = transformStructureModel(
    //   conceptualModel,
    //   model,
    //   Object.values(context.specifications)
    // );
    model = await structureModelAddJsonProperties(model, context.reader);

    model = Object.values(context.conceptualModels).reduce(
        (model, conceptualModel) => transformStructureModel(conceptualModel, model, Object.values(context.specifications)),
        model
    );

    const adapter = new JsonLdAdapter(model, context, artefact);
    return adapter.generate();
  }

  async generateForDocumentation() {
    // todo not implemented
    return null;
  }
}
