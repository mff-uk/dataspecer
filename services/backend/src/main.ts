import { DataSpecificationWithStores } from "@dataspecer/backend-utils/interfaces";
import { StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { PrismaClient } from '@prisma/client';
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import configuration from "./configuration";
import { DataSpecificationModelAdapted, ROOT_PACKAGE_FOR_V1, createV1RootModel } from "./models/data-specification-model-adapted";
import { LocalStoreDescriptor } from "./models/local-store-descriptor";
import { LocalStoreModel } from "./models/local-store-model";
import { ResourceModel } from "./models/resource-model";
import { generateBikeshedRoute } from "./routes/bikeshed";
import { getDefaultConfiguration } from "./routes/configuration";
import { createDataPsm, deleteDataPsm } from "./routes/dataPsm";
import { createPackageResource, createResource, deleteBlob, deleteResource, getBlob, getPackageResource, getResource, getRootPackages, updateBlob, updateResource } from "./routes/resource";
import {
    addSpecification,
    cloneSpecification,
    consistencyFix,
    deleteSpecification, garbageCollection, importSpecifications,
    listSpecifications,
    modifySpecification
} from "./routes/specification";
import { readStore, writeStore } from "./routes/store";
import { convertLocalStoresToHttpStores } from "./utils/local-store-to-http-store";

// Create application models

export const storeModel = new LocalStoreModel("./database/stores");
export const prismaClient = new PrismaClient();
export const resourceModel = new ResourceModel(storeModel, prismaClient);
export const dataSpecificationModel = new DataSpecificationModelAdapted(storeModel, "https://ofn.gov.cz/data-specification/{}", resourceModel);

export const storeApiUrl = configuration.host + '/store/{}';

let basename = new URL(configuration.host).pathname;
if (basename.endsWith('/')) {
    basename = basename.slice(0, -1);
}

export function convertStores(stores: LocalStoreDescriptor[]): StoreDescriptor[] {
    return convertLocalStoresToHttpStores(stores, storeApiUrl);
}

export function replaceStoreDescriptorsInDataSpecification<T extends DataSpecificationWithStores>(dataSpecification: T): T {
    return {
        ...dataSpecification,
        pimStores: convertLocalStoresToHttpStores(dataSpecification.pimStores, storeApiUrl),
        psmStores: Object.fromEntries(Object.entries(dataSpecification.psmStores).map(entry => [entry[0], convertLocalStoresToHttpStores(entry[1] as StoreDescriptor[], storeApiUrl)])),
    }
}

// Run express

const application = express();
application.use(cors());
application.use(bodyParser.json({limit: configuration.payloadSizeLimit}));
application.use(bodyParser.urlencoded({ extended: false, limit: configuration.payloadSizeLimit }));
application.use(bodyParser.urlencoded({ extended: true, limit: configuration.payloadSizeLimit }));

application.get(basename + '/data-specification', listSpecifications);
application.post(basename + '/data-specification', addSpecification);
application.post(basename + '/data-specification/clone', cloneSpecification);
application.delete(basename + '/data-specification', deleteSpecification);
application.put(basename + '/data-specification', modifySpecification);
application.post(basename + '/data-specification/garbage-collection', garbageCollection);
application.post(basename + '/data-specification/consistency-fix', consistencyFix);

application.post(basename + '/data-specification/data-psm', createDataPsm);
application.delete(basename + '/data-specification/data-psm', deleteDataPsm);

application.post(basename + '/import', importSpecifications);

// Api for packages (core-v2)

// Manipulates with resources on metadata level only.
application.get(basename + '/resources', getResource);
application.put(basename + '/resources', updateResource);
application.delete(basename + '/resources', deleteResource);
// Low level API for creating new resources.
application.post(basename + '/resources', createResource);

// Manipulates with raw data (blobs) of the resource, if available.
// Raw data may not be available at all if the resource is not a file, per se. Then, use other operations to access and manipulate the resource.
application.get(basename + '/resources/blob', getBlob);
application.post(basename + '/resources/blob', updateBlob);
application.put(basename + '/resources/blob', updateBlob);
application.delete(basename + '/resources/blob', deleteBlob);

// Operations on resoruces that are interpreted as packages
application.get(basename + '/resources/packages', getPackageResource);
application.post(basename + '/resources/packages', createPackageResource);
application.patch(basename + '/resources/packages', updateResource); // same
application.delete(basename + '/resources/packages', deleteResource); // same
// Special operation to list all root packages
application.get(basename + '/resources/root-resources', getRootPackages); // ---

// Configuration

application.get(basename + '/default-configuration', getDefaultConfiguration);

// API for reading and writing store content.

application.get(basename + '/store/:storeId', readStore);
application.put(basename + '/store/:storeId', writeStore);

// API for generators

application.post(basename + '/transformer/bikeshed', bodyParser.text({type:"*/*", limit: configuration.payloadSizeLimit}), generateBikeshedRoute);

(async () => {
    // Create root models for the common use and for the v1 adapter.
    if (!await resourceModel.getResource(ROOT_PACKAGE_FOR_V1)) {
        console.log("There is no root package for data specifications from v1 dataspecer. Creating one...");
        await createV1RootModel(resourceModel);
    }
    if (!await resourceModel.getResource("http://dataspecer.com/packages/local-root")) {
        console.log("There is no default root package. Creating one...");
        await resourceModel.createPackage(null, "http://dataspecer.com/packages/local-root", {
            label: {
                cs: "Lokální modely",
                en: "Local models"
            },
        });
    }

    application.listen(Number(configuration.port), () => {
        console.log(`Server is listening on port ${Number(configuration.port)}.`);
        console.log(`Try ${configuration.host}/data-specification for a list of data specifications. (should return "[]" for new instances)`);
    });
})();
