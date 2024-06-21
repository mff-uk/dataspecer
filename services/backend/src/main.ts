import { PrismaClient } from '@prisma/client';
import cors from "cors";
import express from "express";
import configuration from "./configuration";
import { DataSpecificationModelAdapted, ROOT_PACKAGE_FOR_V1, createV1RootModel } from "./models/data-specification-model-adapted";
import { LocalStoreModel } from "./models/local-store-model";
import { ResourceModel } from "./models/resource-model";
import { getDefaultConfiguration } from "./routes/configuration";
import { createDataPsm, deleteDataPsm } from "./routes/dataPsm";
import { copyRecursively, createPackageResource, createResource, deleteBlob, deleteResource, getBlob, getPackageResource, getResource, getRootPackages, updateBlob, updateResource } from "./routes/resource";
import {
    addSpecification,
    cloneSpecification,
    consistencyFix,
    deleteSpecification, garbageCollection, importSpecifications,
    listSpecifications,
    modifySpecification
} from "./routes/specification";
import { getSimplifiedSemanticModel, setSimplifiedSemanticModel } from './routes/simplified-semantic-model';
import { getDocumentation, getLightweightOwl, getZip, getlightweightFromSimplified as getlightweightOwlFromSimplified } from './routes/experimental';
import { generate } from './routes/generate';

// Create application models

export const storeModel = new LocalStoreModel("./database/stores");
export const prismaClient = new PrismaClient();
export const resourceModel = new ResourceModel(storeModel, prismaClient);
export const dataSpecificationModel = new DataSpecificationModelAdapted(storeModel, "https://ofn.gov.cz/data-specification/{}", resourceModel);

let basename = new URL(configuration.host).pathname;
if (basename.endsWith('/')) {
    basename = basename.slice(0, -1);
}

// Run express

const application = express();
application.use(cors());
application.use(express.json({limit: configuration.payloadSizeLimit}));
application.use(express.urlencoded({ extended: false, limit: configuration.payloadSizeLimit }));
application.use(express.urlencoded({ extended: true, limit: configuration.payloadSizeLimit }));

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



application.post(basename + '/repository/copy-recursively', copyRecursively);



// Interactive import of packages
//application.post(basename + '/import', importPackages);

// Configuration

application.get(basename + '/default-configuration', getDefaultConfiguration);

// Simplified semantic model

application.get(basename + '/simplified-semantic-model', getSimplifiedSemanticModel);
application.put(basename + '/simplified-semantic-model', setSimplifiedSemanticModel);

// Experimental features

application.get(basename + '/experimental/lightweight-owl.ttl', getLightweightOwl);
application.post(basename + '/experimental/lightweight-owl-from-simplified.ttl', getlightweightOwlFromSimplified);
application.get(basename + '/experimental/documentation.html', getDocumentation);

// Generate artifacts

application.get(basename + '/generate', generate);
application.get(basename + '/experimental/output.zip', getZip);

(async () => {
    // Create local root
    if (!await resourceModel.getResource(configuration.localRootIri)) {
        console.log("There is no default root package. Creating one...");
        await resourceModel.createPackage(null, configuration.localRootIri, configuration.localRootMetadata);
    }
    // Create root models for the common use and for the v1 adapter.
    if (!await resourceModel.getResource(configuration.v1RootIri)) {
        console.log("There is no root package for data specifications from v1 dataspecer. Creating one...");
        await resourceModel.createPackage(null, configuration.v1RootIri, configuration.v1RootMetadata);
    }

    application.listen(Number(configuration.port), () => {
        console.log(`Server is listening on port ${Number(configuration.port)}.`);
        console.log(`Try ${configuration.host}/data-specification for a list of data specifications. (should return "[]" for new instances)`);
    });
})();
