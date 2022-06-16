import { getResource } from "./resources/resource-provider";
import { ReadOnlyMemoryStore } from "../../core";
import { coreResourcesToConceptualModel } from "../../conceptual-model";
import { coreResourcesToStructuralModel } from "../../structure-model";
import { transformStructureModel } from "../../structure-model/transformation";
import { structureModelToCsvSchema } from "../csv-schema-model-adapter";
import { CsvSchemaGeneratorOptions } from "../csv-schema-generator-options";

const testNamePrefix = "CSV generator: ";

async function arrangeSpecAndModel(storeResource, specificationResource) {
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

test(testNamePrefix + "correct @id", async () => {
    const arranged = await arrangeSpecAndModel(getResource("basic_tree_merged_store.json"), getResource("basic_tree_data_specifications.json"));
    const options = new CsvSchemaGeneratorOptions();
    const result = structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options);
    expect(result.table["@id"]).toBe("https://ofn.gov.cz/schema/unittests/tourist-destination/schema.csv-metadata.json");
});
