import {
    ArtefactGenerator,
    ArtefactGeneratorContext
} from "../generator";
import {
    DataSpecification,
    DataSpecificationArtefact, DataSpecificationSchema
} from "../data-specification/model";
import {StreamDictionary} from "../io/stream/stream-dictionary";
import {RDF_TO_CSV} from "./rdf-to-csv-vocabulary";
import {SparqlSelectQuery} from "../sparql-query/sparql-model";
import {writeSparqlQuery} from "../sparql-query";
import {CsvSchemaGenerator} from "../csv-schema/csv-schema-generator";
import {
    buildSingleTableQuery,
    buildMultipleTableQueries
} from "./rdf-to-csv-query-builder";
import {SingleTableSchema} from "../csv-schema/csv-schema-model";
import {assertFailed, assertNot} from "../core";
import {transformStructureModel} from "../structure-model/transformation";
import {
    CsvConfiguration,
    CsvConfigurator,
    DefaultCsvConfiguration
} from "../csv-schema/csv-configuration";

export class RdfToCsvGenerator implements ArtefactGenerator {

    identifier(): string {
        return RDF_TO_CSV.Generator;
    }

    async generateToStream(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification,
        output: StreamDictionary
    ): Promise<void> {
        const result = await this.generateToObject(context, artefact, specification);
        const stream = output.writePath(artefact.outputPath);
        if (Array.isArray(result)) {
            for (const query of result) {
                await writeSparqlQuery(query, stream);
                await stream.write("\n");
            }
        }
        else {
            await writeSparqlQuery(result, stream);
        }
        await stream.close();
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
    ): Promise<SparqlSelectQuery | SparqlSelectQuery[]> {
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

        if (configuration.enableMultipleTableSchema) {
            return buildMultipleTableQueries(specification, model);
        }
        else {
            const csvGenerator = new CsvSchemaGenerator();
            const csvSchema = await csvGenerator.generateToObject(context, artefact, specification);
            if (csvSchema instanceof SingleTableSchema) return buildSingleTableQuery(csvSchema);
            else assertFailed("Wrong CSV schema was generated!");
        }
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
