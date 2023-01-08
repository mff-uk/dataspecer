import {
    splitIri,
    addPrefix,
    buildMultipleTableQueries
} from "../rdf-to-csv-query-builder";
import { getResource } from "../../csv-schema/tests/resources/resource-provider";
import { arrangeSpecAndModel } from "../../csv-schema/tests/test-helpers";

const testNamePrefix = "RDF to CSV: ";

async function createRdfToCsvQueries(specification, store) {
    const arranged = await arrangeSpecAndModel(getResource(specification), getResource(store));
    return buildMultipleTableQueries(arranged.structureModel);
}

async function commonArrange1() {
    return await createRdfToCsvQueries("basic_tree_data_specifications.json", "basic_tree_merged_store.json");
}

test(testNamePrefix + "split IRI namespace slash", async () => {
    const split = splitIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    expect(split.namespace).toBe("https://slovník.gov.cz/datový/číselníky/pojem/");
});

test(testNamePrefix + "split IRI local slash", async () => {
    const split = splitIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    expect(split.local).toBe("alternativní-název-položky-číselníku");
});

test(testNamePrefix + "split IRI namespace sharp", async () => {
    const split = splitIri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    expect(split.namespace).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
});

test(testNamePrefix + "split IRI local sharp", async () => {
    const split = splitIri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
    expect(split.local).toBe("type");
});

test(testNamePrefix + "add prefix", async () => {
    const prefixes = {};
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", prefixes);
    expect(newPrefix).toBe("ns1");
});

test(testNamePrefix + "add prefixes", async () => {
    const prefixes = {};
    addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", prefixes);
    addPrefix("https://slovník.gov.cz/datový/číselníky/hnojem/", prefixes);
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", prefixes);
    expect(newPrefix).toBe("ns3");
});

test(testNamePrefix + "add same prefixes", async () => {
    const prefixes = {};
    addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", prefixes);
    addPrefix("https://slovník.gov.cz/datový/číselníky/pojem/", prefixes);
    const newPrefix = addPrefix("https://slovník.gov.cz/datový/číselníky/dojem/", prefixes);
    expect(newPrefix).toBe("ns1");
});

test(testNamePrefix + "add well-known prefix", async () => {
    const prefixes = {};
    const newPrefix = addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefixes);
    expect(newPrefix).toBe("rdf");
});

test(testNamePrefix + "add well-known prefixes", async () => {
    const prefixes = {};
    addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefixes);
    const newPrefix = addPrefix("http://purl.org/dc/terms/", prefixes);
    expect(newPrefix).toBe("dc");
});

test(testNamePrefix + "check if well-known prefix saved", async () => {
    const prefixes = {};
    addPrefix("http://www.w3.org/1999/02/22-rdf-syntax-ns#", prefixes);
    expect(prefixes["rdf"]).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
});

test(testNamePrefix + "short select length", async () => {
    const queries = await commonArrange1();
    expect(queries[0].select.length).toBe(2);
});

test(testNamePrefix + "table url comment", async () => {
    const queries = await commonArrange1();
    expect(queries[0].select.pop()).toMatch(/^# Table:/);
});

test(testNamePrefix + "rdf:type object", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[0].object.qname[1]).toBe("turistický-cíl");
});

test(testNamePrefix + "longer select length", async () => {
    const queries = await commonArrange1();
    expect(queries[1].select.length).toBe(3);
});

test(testNamePrefix + "as pattern", async () => {
    const queries = await commonArrange1();
    expect(queries[1].select[1]).toBe("(?v2 AS ?kapacita)");
});

test(testNamePrefix + "number of queries", async () => {
    const queries = await commonArrange1();
    expect(queries.length).toBe(13);
});

test(testNamePrefix + "same where patterns", async () => {
    const queries = await commonArrange1();
    expect(queries[3].where).toBe(queries[10].where);
});

test(testNamePrefix + "same prefixes", async () => {
    const queries = await commonArrange1();
    expect(queries[1].prefixes).toBe(queries[5].prefixes);
});

test(testNamePrefix + "prefix", async () => {
    const queries = await commonArrange1();
    expect(queries[1].prefixes["ns2"]).toBe("https://slovník.gov.cz/datový/sportoviště/pojem/");
});

test(testNamePrefix + "table bonding triple subject", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].subject.variableName).toBe("v1");
});

test(testNamePrefix + "table bonding triple predicate", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].predicate.qname[1]).toBe("bezbariérovost");
});

test(testNamePrefix + "table bonding triple object", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].object.variableName).toBe("v3");
});
