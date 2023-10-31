import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { JsonSchema } from "./json-schema-model";
import { writeJsonSchema } from "./json-schema-writer";
import { structureModelToJsonSchema } from "./json-schema-model-adapter";
import { assertFailed, assertNot } from "@dataspecer/core/core";
import {
  structureModelAddDefaultValues,
  transformStructureModel
} from "@dataspecer/core/structure-model/transformation";
import { createBikeshedSchemaJson } from "./json-schema-to-bikeshed";
import { BIKESHED, BikeshedAdapterArtefactContext } from "@dataspecer/bikeshed";
import { JSON_SCHEMA } from "./json-schema-vocabulary";
import { structureModelAddIdAndTypeProperties } from "./json-id-transformations";
import {DefaultJsonConfiguration, JsonConfiguration, JsonConfigurator} from "../configuration";
import {structureModelAddJsonProperties} from "../json-structure-model/add-json-properties";
import {DataSpecificationConfigurator, DefaultDataSpecificationConfiguration, DataSpecificationConfiguration} from "@dataspecer/core/data-specification/configuration";

export class JsonSchemaGenerator implements ArtefactGenerator {
  identifier(): string {
    return JSON_SCHEMA.Generator;
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

  async generateToObject(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification
  ): Promise<JsonSchema> {
    if (!DataSpecificationSchema.is(artefact)) {
      assertFailed("Invalid artefact type.");
    }
    const schemaArtefact = artefact as DataSpecificationSchema;
    const conceptualModel = context.conceptualModels[specification.pim];
    // Options for the JSON generator
    const configuration = JsonConfigurator.merge(
        DefaultJsonConfiguration,
        JsonConfigurator.getFromObject(schemaArtefact.configuration)
    ) as JsonConfiguration;
    // Global options for the data specification
    const globalConfiguration = DataSpecificationConfigurator.merge(
        DefaultDataSpecificationConfiguration,
        DataSpecificationConfigurator.getFromObject(schemaArtefact.configuration)
    ) as DataSpecificationConfiguration;
    assertNot(
        conceptualModel === undefined,
        `Missing conceptual model ${specification.pim}.`
    );
    let model = context.structureModels[schemaArtefact.psm];
    assertNot(
        model === undefined,
        `Missing structure model ${schemaArtefact.psm}.`
    );
    model = await structureModelAddJsonProperties(model, context.reader);
    const mergedConceptualModel = {...conceptualModel};
    mergedConceptualModel.classes = Object.fromEntries(Object.values(context.conceptualModels).map(cm => Object.entries(cm.classes)).flat());
    model = transformStructureModel(mergedConceptualModel, model, Object.values(context.specifications));
    model = structureModelAddDefaultValues(model, globalConfiguration);
    model = structureModelAddIdAndTypeProperties(model, configuration);
    return structureModelToJsonSchema(context.specifications, specification, model, configuration, artefact);
  }

  // todo add structureModelAddIdAndTypeProperties
  async generateForDocumentation(
      context: ArtefactGeneratorContext,
      artefact: DataSpecificationArtefact,
      specification: DataSpecification,
      documentationIdentifier: string,
      callerContext: unknown
  ): Promise<unknown | null> {
    if (documentationIdentifier === BIKESHED.Generator) {
      const bikeshedContext = callerContext as BikeshedAdapterArtefactContext;
      return createBikeshedSchemaJson({
        ...bikeshedContext,
        structureModel: transformStructureModel(
            bikeshedContext.conceptualModel,
            bikeshedContext.structureModel,
            Object.values(context.specifications)
        ),
      });
    }
    return null;
  }
}

