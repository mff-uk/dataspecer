import { getResource } from "./resources/resource-provider";
import { ReadOnlyMemoryStore } from "../../core";
import { coreResourcesToConceptualModel } from "../../conceptual-model";
import { coreResourcesToStructuralModel } from "../../structure-model";
import { transformStructureModel } from "../../structure-model/transformation";
import { structureModelToCsvSchema } from "../csv-schema-model-adapter";
import { CsvSchemaGeneratorOptions } from "../csv-schema-generator-options";

const testNamePrefix = "CSV generator: ";

async function arrangeSpecAndModel(specificationResource, storeResource) {
    const dataSpecificationIri = Object.values(specificationResource)[0].iri;
    const psmIri = specificationResource[dataSpecificationIri].psms[0];

    const store = ReadOnlyMemoryStore.create(storeResource);
    const dataSpecification = specificationResource[dataSpecificationIri];

    const conceptualModel = await coreResourcesToConceptualModel(
        store,
        dataSpecification.pim
    );

    let structureModel = await coreResourcesToStructuralModel(
        store,
        psmIri
    );

    structureModel = transformStructureModel(
        conceptualModel,
        structureModel,
        Object.values(specificationResource)
    );
    return { dataSpecification, structureModel };
}

/**
 * Arrange a basic tree
 */
async function commonArrange1(multipleTable) {
    const arranged = await arrangeSpecAndModel(getResource("basic_tree_data_specifications.json"), getResource("basic_tree_merged_store.json"));
    const options = new CsvSchemaGeneratorOptions();
    options.enableMultipleTableSchema = multipleTable;
    return JSON.parse(structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options).makeJsonLD());
}

/**
 * Arrange a tree with advanced features: dematerialization, include, or
 */
async function commonArrange2(multipleTable) {
    const arranged = await arrangeSpecAndModel(getResource("demat_include_or_data_specifications.json"), getResource("demat_include_or_merged_store.json"));
    const options = new CsvSchemaGeneratorOptions();
    options.enableMultipleTableSchema = multipleTable;
    return JSON.parse(structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options).makeJsonLD());
}

/**
 * Arrange a tree with datatypes
 */
async function commonArrange3() {
    const arranged = await arrangeSpecAndModel(getResource("datatypes_data_specifications.json"), getResource("datatypes_merged_store.json"));
    const options = new CsvSchemaGeneratorOptions();
    options.enableMultipleTableSchema = false;
    return JSON.parse(structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options).makeJsonLD());
}

test(testNamePrefix + "@context", async () => {
    const result = await commonArrange1(false);
    expect(result["@context"][0]).toBe("http://www.w3.org/ns/csvw");
});

test(testNamePrefix + "@id", async () => {
    const result = await commonArrange1(false);
    expect(result["@id"]).toBe("https://ofn.gov.cz/schema/unittests/tourist-destination/schema.csv-metadata.json");
});

test(testNamePrefix + "@type", async () => {
    const result = await commonArrange1(false);
    expect(result["@type"]).toBe("Table");
});

test(testNamePrefix + "url", async () => {
    const result = await commonArrange1(false);
    expect(result["url"]).toBe("https://ofn.gov.cz/schema/unittests/tourist-destination/schema.csv-metadata.json/table.csv");
});

test(testNamePrefix + "tableSchema @type", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema["@type"]).toBe("Schema");
});

test(testNamePrefix + "number of columns", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns.length).toBe(9);
});

test(testNamePrefix + "column @type", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["@type"]).toBe("Column");
});

test(testNamePrefix + "column name", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["name"]).toBe("kapacita");
});

test(testNamePrefix + "column titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["titles"]).toBe("kapacita");
});

test(testNamePrefix + "column dc:title @value", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["dc:title"]["@value"]).toBe("kapacita");
});

test(testNamePrefix + "column dc:title @language", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["dc:title"]["@language"]).toBe("cs");
});

test(testNamePrefix + "column propertyUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["propertyUrl"]).toBe("https://slovník.gov.cz/datový/sportoviště/pojem/kapacita");
});

test(testNamePrefix + "column lang", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[0]["lang"]).toBe("cs");
});

test(testNamePrefix + "encoded name", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["name"]).toBe("bezbari%C3%A9rovost_braillovo_p%C3%ADsmo");
});

test(testNamePrefix + "encoded title", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["titles"]).toBe("bezbariérovost_braillovo_písmo");
});

test(testNamePrefix + "more dc:titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["dc:title"].length).toBe(2);
});

test(testNamePrefix + "more dc:titles second @language", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[1]["dc:title"][1]["@language"]).toBe("en");
});

test(testNamePrefix + "flattened nested property titles", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[5]["titles"]).toBe("bezbariérovost_přístupnost_pro_seniory_popis_popsaného_prvku");
});

test(testNamePrefix + "bare association title", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[6]["titles"]).toBe("má_dostupný_jazyk");
});

test(testNamePrefix + "codelist column valueUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["valueUrl"]).toBe("{+bezbari%C3%A9rovost_m%C3%A1_mapuj%C3%ADc%C3%AD_subjekt}");
});

test(testNamePrefix + "codelist column no lang", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["lang"]).toBe(undefined);
});

test(testNamePrefix + "codelist datatype", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[3]["datatype"]).toBe("anyURI");
});

test(testNamePrefix + "virtual column", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[8]["virtual"]).toBe(true);
});

test(testNamePrefix + "virtual column valueUrl", async () => {
    const result = await commonArrange1(false);
    expect(result.tableSchema.columns[8]["valueUrl"]).toBe("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
});

test(testNamePrefix + "number of tables", async () => {
    const result = await commonArrange1(true);
    expect(result.tables.length).toBe(3);
});

test(testNamePrefix + "multiple table @type", async () => {
    const result = await commonArrange1(true);
    expect(result["@type"]).toBe("TableGroup");
});

test(testNamePrefix + "id column", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[0].tableSchema.columns[0]["name"]).toBe("ReferenceId");
});

test(testNamePrefix + "numeric table url", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1]["url"].slice(-5)).toBe("2.csv");
});

test(testNamePrefix + "association virtual column", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema.columns[5]["valueUrl"]).toBe("https://slovník.gov.cz/generický/bezbariérové-přístupy/pojem/bezbariérový-přístup");
});

test(testNamePrefix + "foreign key table", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema["foreignKeys"][0]["reference"]["resource"]).toBe("https://ofn.gov.cz/schema/unittests/tourist-destination/schema.csv-metadata.json/tables/1.csv");
});

test(testNamePrefix + "foreign key column", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema["foreignKeys"][0]["reference"]["columnReference"]).toBe("bezbari%C3%A9rovost");
});

test(testNamePrefix + "first level number of columns", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[0].tableSchema.columns.length).toBe(6);
});

test(testNamePrefix + "second level number of columns", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[1].tableSchema.columns.length).toBe(6);
});

test(testNamePrefix + "third level number of columns", async () => {
    const result = await commonArrange1(true);
    expect(result.tables[2].tableSchema.columns.length).toBe(4);
});

test(testNamePrefix + "include", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[1]["titles"]).toBe("má_lokalizaci_název_městského_obvodu/městské_části");
});

test(testNamePrefix + "or", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[2]["titles"]).toBe("má_místnost_lokalizační_popis");
});

test(testNamePrefix + "dematerialization", async () => {
    const result = await commonArrange2(false);
    expect(result.tableSchema.columns[3]["titles"]).toBe("týká_se_místa_informace");
});

test(testNamePrefix + "advanced features multiple tables", async () => {
    const result = await commonArrange2(true);
    expect(result.tables.length).toBe(4);
});

test(testNamePrefix + "advanced features top columns", async () => {
    const result = await commonArrange2(true);
    expect(result.tables[0].tableSchema.columns.length).toBe(6);
});

test(testNamePrefix + "include table", async () => {
    const result = await commonArrange2(true);
    expect(result.tables[2].tableSchema.columns[1]["titles"]).toBe(result.tables[1].tableSchema.columns[1]["titles"]);
});

test(testNamePrefix + "or table", async () => {
    const result = await commonArrange2(true);
    expect(result.tables[3].tableSchema.columns[1]["titles"]).toBe("lokalizační_popis");
});

test(testNamePrefix + "dematerialization in tables", async () => {
    const result = await commonArrange2(true);
    expect(result.tables[0].tableSchema.columns[4]["titles"]).toBe("týká_se_místa_informace");
});

test(testNamePrefix + "datatype integer", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[0]["datatype"]).toBe("integer");
});

test(testNamePrefix + "datatype boolean", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[1]["datatype"]).toBe("boolean");
});

test(testNamePrefix + "datatype anyURI", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[2]["datatype"]).toBe("anyURI");
});

test(testNamePrefix + "no lang for datatype", async () => {
    const result = await commonArrange3();
    expect(result.tableSchema.columns[0]["lang"]).toBe(undefined);
});
