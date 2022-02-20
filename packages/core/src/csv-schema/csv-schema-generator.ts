import {
    ArtefactGenerator,
    ArtefactGeneratorContext
} from "../generator";
import {
    DataSpecification,
    DataSpecificationArtefact,
    DataSpecificationSchema
} from "../data-specification/model";
import {StreamDictionary} from "../io/stream/stream-dictionary";
import {CSV_SCHEMA} from "./csv-schema-vocabulary";
import {assertFailed, assertNot} from "../core";
import {transformStructureModel} from "../structure-model/transformation";
import {CsvSchema} from "./csv-schema-model";

export class CsvSchemaGenerator implements ArtefactGenerator {

    identifier(): string {
        return CSV_SCHEMA.Generator;
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        output: StreamDictionary
    ): Promise<void> {
        const model = await this.generateToObject(context, artefact, specification);
        const stream = output.writePath(artefact.outputPath);
        await stream.write(model.mockContent);
        await stream.close();
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
    ): Promise<CsvSchema> {
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
        model = transformStructureModel(
            conceptualModel, model, Object.values(context.specifications));
        return new CsvSchema();
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
