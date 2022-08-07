import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Column,
    AbsoluteIRI,
    CompactIRI
} from "../csv-schema/csv-schema-model";
import {
    SparqlSelectQuery,
    SparqlNode,
    SparqlQNameNode,
    SparqlUriNode,
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
    object: SparqlNode,
    query: SparqlSelectQuery
) : void {
    const triple = new SparqlTriple();
    triple.subject = subject;
    triple.object = object;

    if (column.propertyUrl) {
        if (column.propertyUrl instanceof AbsoluteIRI) triple.predicate = nodeFromIri(column.propertyUrl.value, query.prefixes);
        else if (column.propertyUrl instanceof CompactIRI) triple.predicate = nodeFromIri(resolveCompactIri(column.propertyUrl), query.prefixes);
        else assertFailed("Ivalid IRI format!");
    }
    else if (column.name) {
        const node = new SparqlUriNode();
        node.uri = "#" + column.name;
        triple.predicate = node;
    }
    else assertFailed("Missing property identifier in column!");

    query.where.elements.push(triple);
}

/**
 * This function creates an RDF triple node from an IRI and adds a necessary prefix to query.
 */
function nodeFromIri(iriString: string, queryPrefixes: Record<string, string>) : SparqlQNameNode {
    const separatedIri = splitIri(iriString);
    const prefix = addPrefix(separatedIri.namespace, queryPrefixes);
    const node = new SparqlQNameNode();
    node.qname = [prefix, separatedIri.local];
    return node;
}

/**
 * This constant holds CSV on the Web JSON-LD metadata context from https://www.w3.org/ns/csvw.jsonld
 */
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
 * This function creates a prefix from a namespace IRI, adds the namespace into a query and returns the prefix.
 */
export function addPrefix(namespaceIri: string, queryPrefixes: Record<string, string>) : string {
    // Check if the namespace is already present.
    for (const ns in queryPrefixes) {
        if (queryPrefixes[ns] === namespaceIri) return ns;
    }

    // Check if the namespace is well-known.
    for (const key in csvwContext["@context"]) {
        if (csvwContext["@context"][key] === namespaceIri) {
            queryPrefixes[key] = namespaceIri;
            return key;
        }
    }

    // Find max number of generic prefix.
    const genericPrefix = "ns";
    let max = 0;
    for (const ns in queryPrefixes) {
        if (ns.slice(0, 2) === genericPrefix) {
            let nsNumber = parseInt(ns.slice(2));
            if (nsNumber > max) max = nsNumber;
        }
    }
    const newPrefix = genericPrefix + (max + 1).toString();
    queryPrefixes[newPrefix] = namespaceIri;
    return newPrefix;
}
