import { PrismaClient } from "@prisma/client";
import { APIAdapterForPackagesAndResources } from "../models/resource-model";
import { LocalStoreModel } from "../models/local-store-model";
import { V1 } from "@dataspecer/core-v2/model/known-models";

(async () => {    
    const prisma = new PrismaClient();
    const dataSpecifications = await prisma.$queryRaw`SELECT * FROM DataSpecification` as any[];
    const dataStructures = await prisma.$queryRaw`SELECT * FROM DataStructure` as any[];
    const reuses = await prisma.$queryRaw`SELECT * FROM _DataSpecificationReuse` as any[];
    prisma.$disconnect();
    
    
    const adapter = new APIAdapterForPackagesAndResources(null as any, prisma);
    const storeModel = new LocalStoreModel("./database/stores");
    
    const rootPackage = "http://dataspecer.com/packages/v1";
    
    
    await adapter.createPackage(null, rootPackage, {});
    
    for (const dataSpecification of dataSpecifications) {
        const pimBuffer = await storeModel.get(dataSpecification.storeId);
        const pim = JSON.parse(pimBuffer!.toString());
        const label = pim.resources[dataSpecification.pimSchema].pimHumanLabel;
        const description = pim.resources[dataSpecification.pimSchema].pimHumanDescription;
        
        // Data specification
        await adapter.createPackage(rootPackage, dataSpecification.id, {
            label,
            description,
            tags: JSON.parse(dataSpecification.tags)
        });

        // Package metadata
        const packageStore = await adapter.getOrCreateResourceModelStore(dataSpecification.id);
        await packageStore.setJson({
            dataStructuresImportPackages: reuses.filter(r => r.A === dataSpecification.id).map(r => r.B),
        });

        // Generator configuration
        {
            await adapter.createResource(dataSpecification.id, dataSpecification.id + "/default-generator-configuration", V1.GENERATOR_CONFIGURATION, {});
            const store = await adapter.getOrCreateResourceModelStore(dataSpecification.id + "/default-generator-configuration");
            await store.setString(dataSpecification.artifactsConfiguration);
        }
        
        // CIM
        {
            await adapter.createResource(dataSpecification.id, dataSpecification.id + "/cim", V1.CIM, {});
            const store = await adapter.getOrCreateResourceModelStore(dataSpecification.id + "/cim");
            await store.setString(dataSpecification.cimAdapters);
        }

        // PIM
        await adapter.createResource(dataSpecification.id, dataSpecification.pimSchema, V1.PIM, {});
        await adapter.assignExistingStoreToResource(dataSpecification.pimSchema, dataSpecification.storeId);
        
        // PSM
        const structures = dataStructures.filter(ds => ds.belongsToDataSpecificationId === dataSpecification.id);
        for (const structure of structures) {
            const psmBuffer = await storeModel.get(structure.storeId);
            const psm = JSON.parse(psmBuffer!.toString());
            const label = psm.resources[structure.psmSchema].dataPsmHumanLabel;
            const description = psm.resources[structure.psmSchema].dataPsmHumanDescription;

            await adapter.createResource(dataSpecification.id, structure.psmSchema, V1.PSM, {
                label,
                description,
            });
            await adapter.assignExistingStoreToResource(structure.psmSchema, structure.storeId);
        }
    }
})();