import {
    CsvSchema,
    SingleTableSchema,
    MultipleTableSchema,
    Column,
    AbsoluteIri,
    CompactIri
} from "../csv-schema/csv-schema-model";
import {
    SparqlSelectQuery,
    SparqlNode,
    SparqlQNameNode,
    SparqlUriNode,
    SparqlVariableNode,
    SparqlTriple,
    SparqlPattern,
    SparqlOptionalPattern
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
    query.prefixes = {};
    query.select = [];
    query.where = new SparqlPattern();
    query.where.elements = [];
    const commonSubject = new SparqlVariableNode();
    commonSubject.variableName = "cs";
    let objectIndex = 1;

    for (const column of schema.table.tableSchema.columns) {
        const triple = new SparqlTriple();
        triple.subject = commonSubject;
        triple.predicate = columnToPredicate(column, query.prefixes);
        const objectNode = new SparqlVariableNode();
        if (column.titles === null) {
            objectNode.variableName = "v" + objectIndex.toString();
            objectIndex++;
        }
        else {
            objectNode.variableName = column.titles;
            query.select.push("?" + objectNode.variableName);
        }
        triple.object = objectNode;

        if (column.required || column.virtual) query.where.elements.push(triple);
        else {
            const opt = new SparqlOptionalPattern();
            opt.optionalPattern = new SparqlPattern();
            opt.optionalPattern.elements = [];
            opt.optionalPattern.elements.push(triple);
            query.where.elements.push(opt);
        }
    }
    return query;
}

/**
 * Creates a SPARQL (predicate) node according to the column and adds necessary prefix to the query.
 */
export function columnToPredicate(
    column: Column,
    queryPrefixes: Record<string, string>
) : SparqlNode {
    if (column.propertyUrl instanceof AbsoluteIri) return nodeFromIri(column.propertyUrl.value, queryPrefixes);
    if (column.propertyUrl instanceof CompactIri) return nodeFromIri(resolveCompactIri(column.propertyUrl), queryPrefixes);
    if (column.name) {
        const node = new SparqlUriNode();
        node.uri = "#" + column.name;
        return node;
    }
    assertFailed("Missing property identifier in column!");
}

/**
 * Creates an RDF triple node from an IRI and adds a necessary prefix to query.
 */
function nodeFromIri(iriString: string, queryPrefixes: Record<string, string>) : SparqlQNameNode {
    const separatedIri = splitIri(iriString);
    const prefix = addPrefix(separatedIri.namespace, queryPrefixes);
    const node = new SparqlQNameNode();
    node.qname = [prefix, separatedIri.local];
    return node;
}

/**
 * Holds CSV on the Web JSON-LD metadata context from https://www.w3.org/ns/csvw.jsonld
 */
const csvwContext = JSON.parse(readFileSync(join(__dirname, "csvw-context.jsonld"), "utf8"));

/**
 * Uses CSVW context to resolve prefix and create a full IRI from a compact IRI.
 */
export function resolveCompactIri(compact: CompactIri) : string {
    let absolute = csvwContext["@context"][compact.prefix];
    if (absolute === undefined) assertFailed("Undefined prefix!");
    absolute += compact.suffix;
    return absolute;
}

/**
 * Splits full absolute IRI into a namespace and a local part.
 */
export function splitIri(fullIri: string) : { namespace: string, local: string} {
    let lastBreak = 0;
    for (let i = 0; i < fullIri.length; i++) {
        if (fullIri[i] === "/" || fullIri[i] === "#") lastBreak = i;
    }
    return { namespace: fullIri.slice(0, lastBreak + 1), local: fullIri.slice(lastBreak + 1) }
}

/**
 * Creates a prefix from a namespace IRI, adds the namespace into a query and returns the prefix.
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
        if (ns.slice(0, genericPrefix.length) === genericPrefix) {
            let nsNumber = parseInt(ns.slice(genericPrefix.length));
            if (nsNumber > max) max = nsNumber;
        }
    }
    const newPrefix = genericPrefix + (max + 1).toString();
    queryPrefixes[newPrefix] = namespaceIri;
    return newPrefix;
}
