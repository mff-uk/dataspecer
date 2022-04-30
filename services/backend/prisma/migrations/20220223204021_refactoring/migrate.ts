import {PrismaClient} from "@prisma/client";
import {LocalStoreModel} from "../../../src/models/local-store-model";
import {CoreResource} from "@dataspecer/core/core";
import {PimSchema} from "@dataspecer/core/pim/model";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";

(async() => {
    const prismaClient = new PrismaClient();
    const storeModel = new LocalStoreModel("./database/stores");

    const dataSpecifications = await prismaClient.dataSpecification.findMany();
    for (const dataSpecification of dataSpecifications) {
        const storeId = dataSpecification.storeId;
        const rawData = await storeModel.get(storeId);
        if (!rawData) {
            console.warn(dataSpecification.id, "store does not exist");
            continue;
        }
        const rawObject = JSON.parse(rawData.toString());
        const resources = Object.values(rawObject.resources) as CoreResource[];
        const schema = resources.find(PimSchema.is) as PimSchema;
        if (!schema) {
            console.warn(dataSpecification.id, "no schema found");
            continue;
        }
        await prismaClient.dataSpecification.update({
            where: {id: dataSpecification.id},
            data: {pimSchema: schema.iri as string}
        });
        console.info("Data specification", dataSpecification.id, "updated. New schema is", schema.iri);
    }

    const dataStructures = await prismaClient.dataStructure.findMany();
    for (const dataStructure of dataStructures) {
        const storeId = dataStructure.storeId;
        const rawData = await storeModel.get(storeId);
        if (!rawData) {
            console.warn(dataStructure.id, "store does not exist");
            continue;
        }
        const rawObject = JSON.parse(rawData.toString());
        const resources = Object.values(rawObject.resources) as CoreResource[];
        const schema = resources.find(DataPsmSchema.is) as DataPsmSchema;
        if (!schema) {
            console.warn(dataStructure.id, "no schema found");
            continue;
        }
        await prismaClient.dataStructure.update({
            where: {id: dataStructure.id},
            data: {psmSchema: schema.iri as string}
        });
        console.info("Data structure", dataStructure.id, "updated. New schema is", schema.iri);
    }
})();

