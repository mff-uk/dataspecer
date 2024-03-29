import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { XmlSchema } from "./xml-schema-model";
import { writeXmlSchema } from "./xml-schema-writer";
import { structureModelToXmlSchema } from "./xml-schema-model-adapter";
import { assertFailed, assertNot } from "@dataspecer/core/core";
import { defaultStructureTransformations, structureModelDematerialize,structureModelFlattenInheritance, transformStructureModel } from "@dataspecer/core/structure-model/transformation";
import { BIKESHED, BikeshedAdapterArtefactContext } from "@dataspecer/bikeshed";
import { XML_SCHEMA } from "./xml-schema-vocabulary";
import { createBikeshedSchemaXml } from "./xml-schema-to-bikeshed";
import { structureModelAddXmlProperties } from "../xml-structure-model/add-xml-properties"

export class XmlSchemaGenerator implements ArtefactGenerator {
  identifier(): string {
    return XML_SCHEMA.Generator;
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await writeXmlSchema(model, stream);
    await stream.close();
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<XmlSchema> {
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
    
    const transformations = defaultStructureTransformations.filter(
      transformation =>
        transformation !== structureModelFlattenInheritance &&
        transformation !== structureModelDematerialize
    );
    model = transformStructureModel(
      conceptualModel,
      model,
      Object.values(context.specifications),
      null,
      transformations
    );

    const xmlModel = await structureModelAddXmlProperties(
      model, context.reader
    );

    return structureModelToXmlSchema(
      context, specification, schemaArtefact, xmlModel
    );
  }

  async generateForDocumentation(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    documentationIdentifier: string,
    callerContext: unknown
  ): Promise<unknown | null> {
    if (documentationIdentifier === BIKESHED.Generator) {
      const bikeshedContext = callerContext as BikeshedAdapterArtefactContext;
      return createBikeshedSchemaXml({
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
