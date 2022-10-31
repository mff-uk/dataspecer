import {
    ArtefactGenerator,
    ArtefactGeneratorContext
} from "../generator";
import {
    DataSpecification,
    DataSpecificationArtefact
} from "../data-specification/model";
import {StreamDictionary} from "../io/stream/stream-dictionary";
import {RDF_TO_CSV} from "./rdf-to-csv-vocabulary";
import {
    SparqlQuery,
    SparqlConstructQuery
} from "../sparql-query/sparql-model";
import {SparqlGenerator} from "../sparql-query";
import {writeSparqlQuery} from "../sparql-query";
import {CsvSchemaGenerator} from "../csv-schema/csv-schema-generator";
import {
    buildSingleTableQuery,
    buildMultipleTableQueries
} from "./rdf-to-csv-query-builder";
import {
    MultipleTableSchema,
    SingleTableSchema
} from "../csv-schema/csv-schema-model";
import {assertFailed} from "../core";

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
        const query = await this.generateToObject(context, artefact, specification);
        const stream = output.writePath(artefact.outputPath);
        await writeSparqlQuery(query, stream);
        await stream.close();
    }

    async generateToObject(
        context: ArtefactGeneratorContext,
        artefact: DataSpecificationArtefact,
        specification: DataSpecification
    ): Promise<SparqlQuery> {
        const csvGenerator = new CsvSchemaGenerator();
        const csvSchema = await csvGenerator.generateToObject(context, artefact, specification);
        if (csvSchema instanceof SingleTableSchema) return buildSingleTableQuery(csvSchema);
        else if (csvSchema instanceof MultipleTableSchema) {
            const sparqlGenerator = new SparqlGenerator();
            const sparqlQuery = await sparqlGenerator.generateToObject(context, artefact, specification);
            if (sparqlQuery instanceof SparqlConstructQuery) return buildMultipleTableQueries(csvSchema, sparqlQuery);
            else assertFailed("Invalid Sparql query!");
        }
        else assertFailed("Invalid CSV schema!");
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
