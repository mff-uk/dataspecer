import { createCsvSchema } from "./test-helpers";

const testNamePrefix = "CSV schema: ";

/**
 * Arrange a basic tree
 */
async function commonArrange1(multipleTable) {
    const schema = await createCsvSchema(multipleTable, "basic_tree_data_specifications.json", "basic_tree_merged_store.json");
    return JSON.parse(schema.makeJsonLD());
}

/**
 * Arrange a tree with advanced features: dematerialization, include, or
 */
async function commonArrange2(multipleTable) {
    const schema = await createCsvSchema(multipleTable, "demat_include_or_data_specifications.json", "demat_include_or_merged_store.json");
    return JSON.parse(schema.makeJsonLD());
}

/**
 * Arrange a tree with datatypes
 */
async function commonArrange3() {
    const schema = await createCsvSchema(false, "datatypes_data_specifications.json", "datatypes_merged_store.json");
    return JSON.parse(schema.makeJsonLD());
}

/**
 * Arrange a tree with multiple cardinalities
 */
async function commonArrange4() {
    const schema = await createCsvSchema(true, "cardinality_data_specifications.json", "cardinality_merged_store.json");
    return JSON.parse(schema.makeJsonLD());
}

test.skip(testNamePrefix + "@context", async () => {
    const result = await commonArrange1(false);
    expect(result["@context"][0]).toBe("http://www.w3.org/ns/csvw");
});

test.skip(testNamePrefix + "@id", async () => {
    const result = await commonArrange1(false);
    expect(result["@id"]).toBe("https://ofn.gov.cz/schema/1655285011931-2bda-c788-8533/table.csv-metadata.json");
});

test.skip(testNamePrefix + "@type", async () => {
    const result = await commonArrange1(false);
    expect(result["@type"]).toBe("Table");
});

test.skip(testNamePrefix + "url", async () => {
    const result = await commonArrange1(false);
    expect(result["url"]).toBe("table.csv");
});

test.skip(testNamePrefix + "tableSchema @type", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema["@type"]).toBe("Schema");
});

test.skip(testNamePrefix + "number of columns", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns.length).toBe(9);
});

test.skip(testNamePrefix + "column @type", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["@type"]).toBe("Column");
});

test.skip(testNamePrefix + "column name", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["name"]).toBe("kapacita");
});

test.skip(testNamePrefix + "column titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["titles"]).toBe("kapacita");
});

test.skip(testNamePrefix + "column dc:title @value", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["dc:title"]["@value"]).toBe("kapacita");
});

test.skip(testNamePrefix + "column dc:title @language", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["dc:title"]["@language"]).toBe("cs");
});

test.skip(testNamePrefix + "column propertyUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["propertyUrl"]).toBe("https://slovník.gov.cz/datový/sportoviště/pojem/kapacita");
});

test.skip(testNamePrefix + "encoded name", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["name"]).toBe("bezbari%C3%A9rovost_braillovo_p%C3%ADsmo");
});

test.skip(testNamePrefix + "encoded title", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["titles"]).toBe("bezbariérovost_braillovo_písmo");
});

test.skip(testNamePrefix + "more dc:titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["dc:title"].length).toBe(2);
});

test.skip(testNamePrefix + "more dc:titles second @language", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["dc:title"][1]["@language"]).toBe("en");
});

test.skip(testNamePrefix + "flattened nested property titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[5]["titles"]).toBe("bezbariérovost_přístupnost_pro_seniory_popis_popsaného_prvku");
});

test.skip(testNamePrefix + "bare association title", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[6]["titles"]).toBe("má_dostupný_jazyk");
});

test.skip(testNamePrefix + "codelist column valueUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["valueUrl"]).toBe("{+bezbari%C3%A9rovost_m%C3%A1_mapuj%C3%ADc%C3%AD_subjekt}");
});

test.skip(testNamePrefix + "codelist column no lang", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["lang"]).toBe(undefined);
});

test.skip(testNamePrefix + "codelist datatype", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["datatype"]).toBe("anyURI");
});

test.skip(testNamePrefix + "virtual column", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[8]["virtual"]).toBe(true);
});

test.skip(testNamePrefix + "virtual column valueUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[8]["valueUrl"]).toBe("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
});

test.skip(testNamePrefix + "multiple table @id", async () => {
    const result = await commonArrange1(true);
    expect(result["@id"]).toBe("https://ofn.gov.cz/schema/1655285011931-2bda-c788-8533/csv-metadata.json");
});

test.skip(testNamePrefix + "multiple table @type", async () => {
    const result = await commonArrange1(true);
    expect(result["@type"]).toBe("TableGroup");
});

test.skip(testNamePrefix + "id column", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[0].tableSchema.columns[0]["name"]).toBe("RowId");
});

test.skip(testNamePrefix + "numeric table url", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1]["url"].slice(-5)).toBe("2.csv");
});

test.skip(testNamePrefix + "foreign key table", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema["foreignKeys"][0]["reference"]["resource"]).toBe("table-1.csv");
});

test.skip(testNamePrefix + "first level columns", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[0].tableSchema.columns.length).toBe(2);
});

test.skip(testNamePrefix + "simple primary key", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[0].tableSchema.primaryKey).toBe("RowId");
});

test.skip(testNamePrefix + "composed primary key one", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema.primaryKey[0]).toBe("Reference");
});

test.skip(testNamePrefix + "composed primary key two", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema.primaryKey[1]).toBe("kapacita");
});

test.skip(testNamePrefix + "include", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[1]["titles"]).toBe("má_lokalizaci_název_městského_obvodu/městské_části");
});

test.skip(testNamePrefix + "or", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[2]["titles"]).toBe("má_místnost_lokalizační_popis");
});

test.skip(testNamePrefix + "dematerialization", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[3]["titles"]).toBe("týká_se_místa_informace");
});

test.skip(testNamePrefix + "datatype integer", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[0]["datatype"]).toBe("integer");
});

test.skip(testNamePrefix + "datatype boolean", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[1]["datatype"]).toBe("boolean");
});

test.skip(testNamePrefix + "datatype anyURI", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[2]["datatype"]).toBe("anyURI");
});

test.skip(testNamePrefix + "no lang for datatype", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[0]["lang"]).toBe(undefined);
});

test.skip(testNamePrefix + "attribute cardinality 1..1 name", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.columns[1]["name"]).toBe("kapacita");
});

test.skip(testNamePrefix + "attribute cardinality 1..1 required", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.columns[1]["required"]).toBe(true);
});

test.skip(testNamePrefix + "attribute cardinality 0..* name", async () => {
    const result = await commonArrange4();
    expect(result.tables[1].tableSchema.columns[1]["name"]).toBe("kou%C5%99en%C3%AD_povoleno");
});

test.skip(testNamePrefix + "attribute cardinality 0..* required", async () => {
    const result = await commonArrange4();
    expect(result.tables[1].tableSchema.columns[1]["required"]).toBe(true);
});

test.skip(testNamePrefix + "attribute cardinality 0..* primary key", async () => {
    const result = await commonArrange4();
    expect(result.tables[1].tableSchema.primaryKey.length).toBe(2);
});

test.skip(testNamePrefix + "attribute cardinality 0..* foreign key", async () => {
    const result = await commonArrange4();
    expect(result.tables[1].tableSchema.foreignKeys[0].reference.resource.slice(-5)).toBe("1.csv");
});

test.skip(testNamePrefix + "empty association cardinality 0..1 name", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.columns[2].name).toBe("kontakt");
});

test.skip(testNamePrefix + "empty association cardinality 0..1 required", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.columns[2].required).toBe(undefined);
});

test.skip(testNamePrefix + "empty association cardinality 1..* name", async () => {
    const result = await commonArrange4();
    expect(result.tables[2].tableSchema.columns[1].name).toBe("m%C3%A1_dostupn%C3%BD_jazyk");
});

test.skip(testNamePrefix + "empty association cardinality 1..* foreign key", async () => {
    const result = await commonArrange4();
    expect(result.tables[2].tableSchema.foreignKeys[0].reference.resource.slice(-5)).toBe("1.csv");
});

test.skip(testNamePrefix + "full association cardinality 0..1 name", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.columns[3].name).toBe("otev%C3%ADrac%C3%AD_doba");
});

test.skip(testNamePrefix + "full association cardinality 0..1 foreign key", async () => {
    const result = await commonArrange4();
    expect(result.tables[0].tableSchema.foreignKeys[0].columnReference).toBe("otev%C3%ADrac%C3%AD_doba");
});

test.skip(testNamePrefix + "full association cardinality 0..1 attribute", async () => {
    const result = await commonArrange4();
    expect(result.tables[3].tableSchema.columns[1].name).toBe("po%C4%8Det_opakov%C3%A1n%C3%AD");
});

test.skip(testNamePrefix + "full association cardinality 0..1 type", async () => {
    const result = await commonArrange4();
    expect(result.tables[3].tableSchema.columns[2].valueUrl).toBe("https://slovník.gov.cz/generický/čas/pojem/časová-specifikace");
});

test.skip(testNamePrefix + "full association cardinality 0..* attribute", async () => {
    const result = await commonArrange4();
    expect(result.tables[4].tableSchema.columns[1].name).toBe("n%C3%A1zev");
});

test.skip(testNamePrefix + "full association cardinality 0..* foreign keys one", async () => {
    const result = await commonArrange4();
    expect(result.tables[5].tableSchema.foreignKeys[0].reference.resource.slice(-5)).toBe("1.csv");
});

test.skip(testNamePrefix + "full association cardinality 0..* foreign keys two", async () => {
    const result = await commonArrange4();
    expect(result.tables[5].tableSchema.foreignKeys[1].reference.resource.slice(-5)).toBe("5.csv");
});
