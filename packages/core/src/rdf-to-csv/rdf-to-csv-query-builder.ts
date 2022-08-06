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

/**
 * This function uses CSVW context to resolve prefix and create a full IRI from a compact IRI.
 */
export function resolveCompactIri(compact: CompactIRI) : string {
    let absolute = csvwContext["@context"][compact.prefix];
    if (absolute === undefined) assertFailed("Undefined prefix!");
    absolute += compact.suffix;
    return absolute;
}

/**
 * This function splits full absolute IRI into a namespace and a local part.
 */
export function splitIri(fullIri: string) : { namespace: string, local: string} {
    let lastSlash = 0;
    for (let i = 0; i < fullIri.length; i++) {
        if (fullIri[i] === "/") lastSlash = i;
    }
    return { namespace: fullIri.slice(0, lastSlash + 1), local: fullIri.slice(lastSlash + 1) }
}

/**
 * This function creates a prefix from a namespace IRI, adds the namespace into query and returns the prefix.
 */
export function addPrefix(namespaceIri: string, query: SparqlSelectQuery) : string {
    // Check if the namespace is already present.
    for (const ns in query.prefixes) {
        if (query.prefixes[ns] === namespaceIri) return ns;
    }

    // Check if the namespace is well-known.
    for (const key in csvwContext["@context"]) {
        if (csvwContext["@context"][key] === namespaceIri) {
            query.prefixes[key] = namespaceIri;
            return key;
        }
    }

    // Find max number of generic prefix.
    const genericPrefix = "ns";
    let max = 0;
    for (const ns in query.prefixes) {
        if (ns.slice(0, 2) === genericPrefix) {
            let nsNumber = parseInt(ns.slice(2));
            if (nsNumber > max) max = nsNumber;
        }
    }
    const newPrefix = genericPrefix + (max + 1).toString();
    query.prefixes[newPrefix] = namespaceIri;
    return newPrefix;
}
