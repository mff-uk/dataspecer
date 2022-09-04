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
import {structureModelToCsvSchema} from "./csv-schema-model-adapter";
import {CsvConfiguration, CsvConfigurator, DefaultCsvConfiguration} from "./csv-configuration";

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
        const schema = await this.generateToObject(context, artefact, specification);
        const stream = output.writePath(artefact.outputPath);
        await stream.write(schema.makeJsonLD());
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
        const configuration = CsvConfigurator.merge(
            DefaultCsvConfiguration,
            CsvConfigurator.getFromObject(schemaArtefact.configuration)
        ) as CsvConfiguration;
        assertNot(
            conceptualModel === undefined,
            `Missing conceptual model ${specification.pim}.`);
        let model = context.structureModels[schemaArtefact.psm];
        assertNot(
            model === undefined,
            `Missing structure model ${schemaArtefact.psm}.`);
        model = transformStructureModel(
            conceptualModel, model, Object.values(context.specifications));
        return structureModelToCsvSchema(specification, model, configuration);
    }

    async generateForDocumentation(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        documentationIdentifier: string,
        callerContext: unknown
    ): Promise<unknown | null> {
        return null; //Todo: What is this good for?
    }
}
