import * as resources from "./csv-test-resources";
import { ReadOnlyMemoryStore } from "../../core";
import { coreResourcesToConceptualModel } from "../../conceptual-model";
import { coreResourcesToStructuralModel } from "../../structure-model";
import { transformStructureModel } from "../../structure-model/transformation";
import { structureModelToCsvSchema } from "../csv-schema-model-adapter";

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
    const arranged = await arrangeSpecAndModel(resources.storeResource_1, resources.specificationResource_1);
    const result = structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel);
    expect(result["@id"]).toBe("https://ofn.gov.cz/schema/testjj/jazyk/schema.csv-metadata.json");
});

test(testNamePrefix + "rdf::type column", async () => {
    const arranged = await arrangeSpecAndModel(resources.storeResource_1, resources.specificationResource_1);
    const result = structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel);
    expect(result.tableSchema.columns[result.tableSchema.columns.length - 1].propertyUrl).toBe("rdf:type");
});
