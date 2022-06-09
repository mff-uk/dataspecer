import {PrismaClient} from "@prisma/client";
import {LocalStoreModel} from "../../src/models/local-store-model";
import {CoreResource} from "@dataspecer/core/core";
import {PimAssociation} from "@dataspecer/core/pim/model";

/**
 * Sets all associations as oriented
 */
(async() => {
    const prismaClient = new PrismaClient();
    const storeModel = new LocalStoreModel("./database/stores");

    const dataSpecifications = await prismaClient.dataSpecification.findMany();
    for (const dataSpecification of dataSpecifications) {
        const storeId = dataSpecification.storeId.split("/").pop() as string;
        const rawData = await storeModel.get(storeId);
        if (!rawData) {
            console.warn(dataSpecification.id, "store does not exist");
            continue;
        }
        const rawObject = JSON.parse(rawData.toString());
        const resources = Object.values(rawObject.resources) as CoreResource[];
        const associations = resources.filter(PimAssociation.is) as PimAssociation[];
        associations.forEach(association => association.pimIsOriented = true);
        await storeModel.set(storeId, JSON.stringify(rawObject));
        console.info("Store", storeId, "updated.");
    }
})();

