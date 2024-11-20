import {
    splitIri,
    addPrefix,
    buildMultipleTableQueries,
    buildSingleTableQuery
} from "../rdf-to-csv-query-builder";
import { getResource } from "../../csv-schema/tests/resources/resource-provider";
import { arrangeSpecAndModel } from "../../csv-schema/tests/test-helpers";

const testNamePrefix = "RDF to CSV: ";

async function createRdfToCsvQueries(specification, store) {
    const arranged = await arrangeSpecAndModel(getResource(specification), getResource(store));
    return buildMultipleTableQueries(arranged.structureModel);
}

async function createRdfToCsvQuery(specification, store) {
    const arranged = await arrangeSpecAndModel(getResource(specification), getResource(store));
    return buildSingleTableQuery(arranged.structureModel);
}

async function commonArrange1() {
    return await createRdfToCsvQueries("basic_tree_data_specifications.json", "basic_tree_merged_store.json");
}

async function commonArrange2() {
    return await createRdfToCsvQuery("basic_tree_data_specifications.json", "basic_tree_merged_store.json");
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

test.skip(testNamePrefix + "short select length", async () => {
    const queries = await commonArrange1();
    expect(queries[0].select.length).toBe(2);
});

test.skip(testNamePrefix + "table url comment", async () => {
    const queries = await commonArrange1();
    expect(queries[0].select.pop()).toMatch(/^# Table:/);
});

test.skip(testNamePrefix + "rdf:type object", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[0].object.qname[1]).toBe("turistický-cíl");
});

test.skip(testNamePrefix + "longer select length", async () => {
    const queries = await commonArrange1();
    expect(queries[1].select.length).toBe(3);
});

test.skip(testNamePrefix + "as pattern", async () => {
    const queries = await commonArrange1();
    expect(queries[1].select[1]).toBe("(?v2 AS ?kapacita)");
});

test.skip(testNamePrefix + "number of queries", async () => {
    const queries = await commonArrange1();
    expect(queries.length).toBe(13);
});

test.skip(testNamePrefix + "same where patterns", async () => {
    const queries = await commonArrange1();
    expect(queries[3].where).toBe(queries[10].where);
});

test.skip(testNamePrefix + "same prefixes", async () => {
    const queries = await commonArrange1();
    expect(queries[1].prefixes).toBe(queries[5].prefixes);
});

test.skip(testNamePrefix + "prefix", async () => {
    const queries = await commonArrange1();
    expect(queries[1].prefixes["ns2"]).toBe("https://slovník.gov.cz/datový/sportoviště/pojem/");
});

test.skip(testNamePrefix + "table bonding triple subject", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].subject.variableName).toBe("v1");
});

test.skip(testNamePrefix + "table bonding triple predicate", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].predicate.qname[1]).toBe("bezbariérovost");
});

test.skip(testNamePrefix + "table bonding triple object", async () => {
    const queries = await commonArrange1();
    expect(queries[0].where.elements[2].optionalPattern.elements[5].object.variableName).toBe("v3");
});

test.skip(testNamePrefix + "single and multiple prefixes equivalence", async () => {
    const queries = await commonArrange1();
    const query = await commonArrange2();
    expect(queries[4].prefixes).toEqual(query.prefixes);
});

test.skip(testNamePrefix + "single and multiple select difference", async () => {
    const queries = await commonArrange1();
    const query = await commonArrange2();
    expect(queries[5].select).not.toEqual(query.select);
});

test.skip(testNamePrefix + "single and multiple where equivalence", async () => {
    const queries = await commonArrange1();
    const query = await commonArrange2();
    expect(queries[6].where).toEqual(query.where);
});

test.skip(testNamePrefix + "single select length", async () => {
    const query = await commonArrange2();
    expect(query.select.length).toBe(8);
});

test.skip(testNamePrefix + "single select as pattern", async () => {
    const query = await commonArrange2();
    expect(query.select[2]).toBe("(?v5 AS ?bezbariérovost_datum_mapování)");
});

test.skip(testNamePrefix + "dematerialization and backwards association subject", async () => {
    const query = await createRdfToCsvQuery("demat_include_or_data_specifications.json", "demat_include_or_merged_store.json");
    expect(query.where.elements[4].optionalPattern.elements[0].subject.variableName).toBe("v8");
});

test.skip(testNamePrefix + "dematerialization and backwards association object", async () => {
    const query = await createRdfToCsvQuery("demat_include_or_data_specifications.json", "demat_include_or_merged_store.json");
    expect(query.where.elements[4].optionalPattern.elements[0].object.variableName).toBe("v1");
});

test.skip(testNamePrefix + "single and multiple backwards association equivalence", async () => {
    const queries = await createRdfToCsvQueries("demat_include_or_data_specifications.json", "demat_include_or_merged_store.json");
    const query = await createRdfToCsvQuery("demat_include_or_data_specifications.json", "demat_include_or_merged_store.json");
    expect(queries[8].where).toEqual(query.where);
});
