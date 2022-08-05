import { createCsvSchema } from "../../csv-schema/tests/test-helpers";
import {
    buildQuery,
    resolveCompactIri
} from "../rdf-to-csv-query-builder";
import { CompactIRI } from "../../csv-schema/csv-schema-model";

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
