import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";
import {StreamDictionary} from "../io/stream/stream-dictionary";
import {
  ArtefactGenerator,
  ArtefactGeneratorContext,
} from "../generator";
import {JsonSchema} from "./json-schema-model";
import {writeJsonSchema} from "./json-schema-writer";
import {structureModelToJsonSchema} from "./json-schema-model-adapter";
import {assertFailed, assertNot} from "../core";
import {transformStructureModel,} from "../structure-model/transformation";
import {createBikeshedSchemaJson} from "./json-schema-to-bikeshed";
import {BIKESHED, BikeshedAdapterArtefactContext} from "../bikeshed";

export class JsonSchemaGenerator implements ArtefactGenerator {

  identifier(): string {
    return "jsonschema";
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await writeJsonSchema(model, stream);
    await stream.close();
  }

  generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<JsonSchema> {
    if (!DataSpecificationSchema.is(artefact)) {
      assertFailed("Invalid artefact type.")
    }
    const schemaArtefact = artefact as DataSpecificationSchema;
    const conceptualModel = context.conceptualModels[specification.pim];
    assertNot(
      conceptualModel === undefined,
      `Missing conceptual model ${specification.pim}.`);
    let model = context.structureModels[schemaArtefact.psm];
    assertNot(
      model === undefined,
      `Missing structure model ${schemaArtefact.psm}.`);
    model = transformStructureModel(conceptualModel, model);
    return Promise.resolve(structureModelToJsonSchema(model));
  }

  async generateForDocumentation(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    documentationIdentifier: string,
    callerContext: unknown,
  ): Promise<unknown | null> {
    if (documentationIdentifier === BIKESHED.Generator) {
      const bikeshedContext = callerContext as BikeshedAdapterArtefactContext;
      return createBikeshedSchemaJson({
        ...bikeshedContext,
        "structureModel": transformStructureModel(
          bikeshedContext.conceptualModel, bikeshedContext.structureModel),
      });
    }
    return null;
  }

}
