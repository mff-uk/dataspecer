import { createCsvSchema } from "../../csv-schema/tests/test-helpers";
import { buildQuery } from "../rdf-to-csv-query-builder";

const testNamePrefix = "RDF to CSV: "

/**
 * Arrange a basic tree
 */
async function commonArrange1(multipleTable) {
    const schema = await createCsvSchema(multipleTable, "basic_tree_data_specifications.json", "basic_tree_merged_store.json");
    return buildQuery(schema);
}

test(testNamePrefix + "", async () => {
    const result = await commonArrange1(false);
    expect(result).toBe("ok");
});
