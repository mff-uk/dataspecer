import {
  DataSpecification,
  DataSpecificationArtefact,
  DataSpecificationSchema,
} from "../data-specification/model";
import { StreamDictionary } from "../io/stream/stream-dictionary";
import { ArtefactGenerator, ArtefactGeneratorContext } from "../generator";
import { SparqlQuery } from "./sparql-model";
import { writeSparqlQuery } from "./sparql-writer";
import { structureModelToSparql } from "./sparql-model-adapter";
import { assertFailed, assertNot } from "../core";
import { defaultStructureTransformations, structureModelDematerialize, transformStructureModel } from "../structure-model/transformation";
import { SPARQL } from "./sparql-vocabulary";
import {isRecursive} from "../structure-model/helper/is-recursive";

export class SparqlGenerator implements ArtefactGenerator {
  identifier(): string {
    return SPARQL.Generator;
  }

  async generateToStream(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    output: StreamDictionary
  ) {
    const model = await this.generateToObject(context, artefact, specification);
    const stream = output.writePath(artefact.outputPath);
    await writeSparqlQuery(model, stream);
    await stream.close();
  }

  generateToObject(
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ): Promise<SparqlQuery> {
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
        transformation !== structureModelDematerialize
    );
    for (const conceptualModel of Object.values(context.conceptualModels)) {
      model = transformStructureModel(
        conceptualModel,
        model,
        Object.values(context.specifications),
        null,
        transformations
      );
    }
    if (isRecursive(model)) {
      throw new Error("SPARQL generator does not support recursive structures.");
    }
    return Promise.resolve(
      structureModelToSparql(context.specifications, specification, model)
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
