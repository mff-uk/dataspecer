import {
    columnToPredicate,
    splitIri,
    addPrefix
} from "../rdf-to-csv-query-builder";
import {
    Column,
    AbsoluteIri,
    CompactIri
} from "../../csv-schema/csv-schema-model";

const testNamePrefix = "RDF to CSV: ";

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

test(testNamePrefix + "absolute propertyUrl column to predicate prefix", async () => {
    const column = new Column();
    column.propertyUrl = new AbsoluteIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    const prefixes = {};
    const result = columnToPredicate(column, prefixes);
    expect(result.qname[0]).toBe("ns1");
});

test(testNamePrefix + "absolute propertyUrl column to predicate local", async () => {
    const column = new Column();
    column.propertyUrl = new AbsoluteIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    const prefixes = {};
    const result = columnToPredicate(column, prefixes);
    expect(result.qname[1]).toBe("alternativní-název-položky-číselníku");
});

test(testNamePrefix + "absolute propertyUrl column to predicate prefix saved", async () => {
    const column = new Column();
    column.propertyUrl = new AbsoluteIri("https://slovník.gov.cz/datový/číselníky/pojem/alternativní-název-položky-číselníku");
    const prefixes = {};
    columnToPredicate(column, prefixes);
    expect(prefixes["ns1"]).toBe("https://slovník.gov.cz/datový/číselníky/pojem/");
});

test(testNamePrefix + "compact propertyUrl column to predicate prefix", async () => {
    const column = new Column();
    column.propertyUrl = new CompactIri("rdf", "type");
    const prefixes = {};
    const result = columnToPredicate(column, prefixes);
    expect(result.qname[0]).toBe("rdf");
});

test(testNamePrefix + "compact propertyUrl column to predicate local", async () => {
    const column = new Column();
    column.propertyUrl = new CompactIri("rdf", "type");
    const prefixes = {};
    const result = columnToPredicate(column, prefixes);
    expect(result.qname[1]).toBe("type");
});

test(testNamePrefix + "compact propertyUrl column to predicate prefix saved", async () => {
    const column = new Column();
    column.propertyUrl = new CompactIri("rdf", "type");
    const prefixes = {};
    columnToPredicate(column, prefixes);
    expect(prefixes["rdf"]).toBe("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
});

test(testNamePrefix + "name column to predicate", async () => {
    const column = new Column();
    column.name = "destination";
    const prefixes = {};
    const result = columnToPredicate(column, prefixes);
    expect(result.uri).toBe("#destination");
});

test(testNamePrefix + "column to predicate missing identifier", async () => {
    const column = new Column();
    const prefixes = {};
    expect(() => columnToPredicate(column, prefixes)).toThrow();
});
