import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema
} from "../csv-schema/csv-schema-model";
import { SparqlQuery } from "../sparql-query/sparql-model";
import { assertFailed } from "../core";

export function buildQuery(schema: CsvSchema) : SparqlQuery {
    if (schema instanceof SingleTableSchema) return buildSingleTableQuery(schema);
    // if (schema instanceof MultipleTableSchema) return "something";
    assertFailed("Invalid CSV schema!");
}

function buildSingleTableQuery(schema: SingleTableSchema) : SparqlQuery {
    return new SparqlQuery();
}
