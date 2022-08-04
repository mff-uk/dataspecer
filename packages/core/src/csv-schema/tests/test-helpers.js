import { getResource } from "./resources/resource-provider";
import { ReadOnlyMemoryStore } from "../../core";
import { coreResourcesToConceptualModel } from "../../conceptual-model";
import { coreResourcesToStructuralModel } from "../../structure-model";
import { transformStructureModel } from "../../structure-model/transformation";
import { structureModelToCsvSchema } from "../csv-schema-model-adapter";
import { CsvSchemaGeneratorOptions } from "../csv-schema-generator-options";

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

export async function createCsvSchema(multipleTable, specification, store) {
    const arranged = await arrangeSpecAndModel(getResource(specification), getResource(store));
    const options = new CsvSchemaGeneratorOptions();
    options.enableMultipleTableSchema = multipleTable;
    return structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options);
}
