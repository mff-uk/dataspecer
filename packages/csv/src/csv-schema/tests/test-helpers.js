import { getResource } from "./resources/resource-provider";
import { ReadOnlyMemoryStore } from "@dataspecer/core/core";
import { coreResourcesToConceptualModel } from "@dataspecer/core/conceptual-model";
import { coreResourcesToStructuralModel } from "@dataspecer/core/structure-model";
import { transformStructureModel } from "@dataspecer/core/structure-model/transformation";
import { structureModelToCsvSchema } from "../csv-schema-model-adapter";
import { DefaultCsvConfiguration } from "../csv-configuration";

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
    const options = {...DefaultCsvConfiguration};
    options.enableMultipleTableSchema = multipleTable;
    return structureModelToCsvSchema(arranged.dataSpecification, arranged.structureModel, options);
}
