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
import {SparqlQuery} from "../sparql-query/sparql-model";
import {writeSparqlQuery} from "../sparql-query";

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
        return new SparqlQuery();
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
