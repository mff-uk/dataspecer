import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Column,
    CompactIRI
} from "../csv-schema/csv-schema-model";
import {
    SparqlSelectQuery,
    SparqlNode,
    SparqlTriple
} from "../sparql-query/sparql-model";
import { assertFailed } from "../core";
import { readFileSync } from "fs";
import { join } from "path";

export function buildQuery(schema: CsvSchema) : SparqlSelectQuery {
    if (schema instanceof SingleTableSchema) return buildSingleTableQuery(schema);
    // if (schema instanceof MultipleTableSchema) return "something";
    assertFailed("Invalid CSV schema!");
}

function buildSingleTableQuery(schema: SingleTableSchema) : SparqlSelectQuery {
    const query = new SparqlSelectQuery();

    return query;
}

function processColumn(
    column: Column,
    subject: SparqlNode,
    query: SparqlSelectQuery
) : void {
    const triple = new SparqlTriple();
    triple.subject = subject;

}

const csvwContext = JSON.parse(readFileSync(join(__dirname, "csvw-context.jsonld"), "utf8"));

export function resolveCompactIri(compact: CompactIRI) : string {
    let absolute = csvwContext["@context"][compact.prefix];
    if (absolute === undefined) assertFailed("Undefined prefix!");
    absolute += compact.suffix;
    return absolute;
}
