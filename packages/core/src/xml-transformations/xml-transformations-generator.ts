import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";
import { StreamDictionary } from "../io/stream/stream-dictionary";
import { ArtefactGenerator, ArtefactGeneratorContext } from "../generator";
import { XmlTransformation } from "./xml-transformations-model";
import { writeXsltLifting } from "./xslt-lifting-writer";
import { writeXsltLowering } from "./xslt-lowering-writer";
import { structureModelToXslt } from "./xml-transformations-adapter";
import { assertFailed, assertNot } from "../core";
import { transformStructureModel } from "../structure-model/transformation";
import { XSLT_LIFTING, XSLT_LOWERING } from "./xml-transformations-vocabulary";

export class XsltGenerator implements ArtefactGenerator {
  isLifting: boolean;

  constructor(isLifting: boolean) {
    this.isLifting = isLifting;
  }

  identifier(): string {
    return this.isLifting ? XSLT_LIFTING.Generator : XSLT_LOWERING.Generator;
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await (this.isLifting ? writeXsltLifting : writeXsltLowering)(model, stream);
    await stream.close();
  }

  generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<XmlTransformation> {
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
    model = transformStructureModel(
      conceptualModel,
      model,
      Object.values(context.specifications)
    );
    return Promise.resolve(
      structureModelToXslt(context.specifications, specification, model)
    );
  }

  async generateForDocumentation(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    documentationIdentifier: string,
    callerContext: unknown
  ): Promise<unknown | null> {
    return null;
  }
}
