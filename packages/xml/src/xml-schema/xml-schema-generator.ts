import { BIKESHED, BikeshedAdapterArtefactContext } from "@dataspecer/bikeshed";
import { assertFailed, assertNot } from "@dataspecer/core/core";
import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "@dataspecer/core/data-specification/model";
import { ArtefactGenerator, ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { defaultStructureTransformations, structureModelTransformCodelists, transformStructureModel } from "@dataspecer/core/structure-model/transformation";
import { structureModelAddXmlProperties } from "../xml-structure-model/add-xml-properties";
import { generateDocumentation } from "./xml-schema-documentation";
import { structureModelToXmlSchema } from "./xml-schema-model-adapter";
import { createBikeshedSchemaXml } from "./xml-schema-to-bikeshed";
import { XML_SCHEMA } from "./xml-schema-vocabulary";
import { writeXmlSchema } from "./xml-schema-writer";

export const NEW_DOC_GENERATOR = "https://schemas.dataspecer.com/generator/template-artifact";

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
    const {xmlSchema: model} = await this.generateToObject(context, artefact, specification);

    const stream = output.writePath(artefact.outputPath);
    await writeXmlSchema(model, stream);
    await stream.close();
  }

  async generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ) {
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
      transformation => true
        //transformation !== structureModelFlattenInheritance &&
        //transformation !== structureModelDematerialize
    );
    model = transformStructureModel(
      conceptualModel,
      model,
      Object.values(context.specifications),
      null,
      transformations
    );

    model = structureModelTransformCodelists(model);

    const xmlModel = await structureModelAddXmlProperties(
      model, context.reader
    );

    return {
      xmlSchema: await structureModelToXmlSchema(
        context, specification, schemaArtefact, xmlModel
      ),
      conceptualModel,
  };
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
    } else if (documentationIdentifier === NEW_DOC_GENERATOR) {
      const {artifact: documentationArtefact} = callerContext as {artifact: DataSpecificationArtefact};
      const {xmlSchema, conceptualModel} = await this.generateToObject(context, artefact, specification);
      // return createRespecSchema(
      //   documentationArtefact,
      //   xmlSchema,
      //   conceptualModel,
      // );
      // todo: We plan to generate the whole documentation using @dataspecer/handlebars-adapter.
      // todo: For now, only this XML documentation is generated with it and returned back to the old documentation generator system.
      const generatedDocumentation = await generateDocumentation(documentationArtefact, xmlSchema, conceptualModel, context, artefact, specification);
      return {
        useTemplate: () => () => generatedDocumentation,
      }
    }
    return null;
  }
}
