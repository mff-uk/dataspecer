import { createCsvSchema } from "../../csv-schema/tests/test-helpers";
import {
    buildQuery,
    resolveCompactIri,
    splitIri,
    addPrefix
} from "../rdf-to-csv-query-builder";
import { CompactIRI } from "../../csv-schema/csv-schema-model";
import { SparqlSelectQuery } from "../../sparql-query/sparql-model";

const testNamePrefix = "RDF to CSV: ";

/**
 * Arrange a basic schema
 */
async function commonArrange1(multipleTable) {
    const schema = await createCsvSchema(multipleTable, "basic_tree_data_specifications.json", "basic_tree_merged_store.json");
    return buildQuery(schema);
}

test(testNamePrefix + "resolve compact IRI", async () => {
    const compact = new CompactIRI("rdf", "type");
    const result = resolveCompactIri(compact);
    expect(result).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
});

test(testNamePrefix + "resolve invalid compact IRI", async () => {
    const compact = new CompactIRI("qwert", "type");
    expect(() => resolveCompactIri(compact)).toThrow();
});

test(testNamePrefix + "split IRI namespace", async () => {
    const split = splitIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    expect(split.namespace).toBe("https://slovník.gov.cz/datový/číselníky/pojem/");
});

test(testNamePrefix + "split IRI local", async () => {
    const split = splitIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    expect(split.local).toBe("alternativní-název-položky-číselníku");
});

test(testNamePrefix + "add prefix", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", query);
    expect(newPrefix).toBe("ns1");
});

test(testNamePrefix + "add prefixes", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", query);
    addPrefix("https://slovník.gov.cz/datový/číselníky/hnojem/", query);
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", query);
    expect(newPrefix).toBe("ns3");
});

test(testNamePrefix + "add same prefixes", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", query);
    addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", query);
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", query);
    expect(newPrefix).toBe("ns1");
});

test(testNamePrefix + "add well-known prefix", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    const newPrefix = addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", query);
    expect(newPrefix).toBe("rdf");
});

test(testNamePrefix + "add well-known prefixes", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", query);
    const newPrefix = addPrefix("http://purl.org/dc/terms/", query);
    expect(newPrefix).toBe("dc");
});

test(testNamePrefix + "check if well-known prefix saved", async () => {
    const query = new SparqlSelectQuery();
    query.prefixes = {};
    addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", query);
    expect(query.prefixes["rdf"]).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
});
