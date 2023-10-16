import express from "express";
import {dataSpecificationModel, replaceStoreDescriptorsInDataSpecification, storeModel} from "../main";
import {UpdateDataSpecification} from "@dataspecer/backend-utils/interfaces";
import {asyncHandler} from "../utils/async-handler";
import {LocalStoreDescriptor} from "../models/local-store-descriptor";
import {dataPsmGarbageCollection, pimGarbageCollection} from "@dataspecer/core/garbage-collection";
import {CoreResource} from "@dataspecer/core/core";
import {PimSchema} from "@dataspecer/core/pim/model";
import {DataPsmSchema} from "@dataspecer/core/data-psm/model";

export const listSpecifications = asyncHandler(async (request: express.Request, response: express.Response) => {
    if (request.query.dataSpecificationIri) {
        const iri = String(request.query.dataSpecificationIri);
        let spec = await dataSpecificationModel.getDataSpecification(iri);
        if (!spec) {
            response.status(404);
            return;
        }
        spec = replaceStoreDescriptorsInDataSpecification(spec);
        response.send(spec);
    } else {
        response.send((await dataSpecificationModel.getAllDataSpecifications()).map(replaceStoreDescriptorsInDataSpecification));
    }
});

export const addSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataToSet = request.body as UpdateDataSpecification;

    const specification = await dataSpecificationModel.createDataSpecification();
    const modifiedDataSpecification = await dataSpecificationModel.modifyDataSpecification(specification.iri as string, dataToSet);
    response.send(replaceStoreDescriptorsInDataSpecification(modifiedDataSpecification));
});

export const cloneSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const dataToSet = request.body.set as UpdateDataSpecification;

    const specification = await dataSpecificationModel.clone(dataSpecificationIri, dataToSet);
    response.send(replaceStoreDescriptorsInDataSpecification(specification));
});

export const deleteSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    await dataSpecificationModel.deleteDataSpecification(dataSpecificationIri);
    response.sendStatus(204);
});

export const modifySpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const dataToUpdate = request.body.update as UpdateDataSpecification;

    const modifiedDataSpecification = await dataSpecificationModel.modifyDataSpecification(dataSpecificationIri, dataToUpdate);
    response.send(replaceStoreDescriptorsInDataSpecification(modifiedDataSpecification));
});

export const garbageCollection = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const dataSpecification = await dataSpecificationModel.getDataSpecification(dataSpecificationIri);
    if (!dataSpecification) {
        response.status(404);
        return;
    }

    const pimStore = await LocalStoreDescriptor.construct(dataSpecification.pimStores[0] as LocalStoreDescriptor, storeModel);
    const psmStores = await Promise.all(Object.values(dataSpecification.psmStores).map(async (stores) => {
        return await LocalStoreDescriptor.construct(stores[0] as LocalStoreDescriptor, storeModel);
    }));

    await pimStore.loadStore();
    await Promise.all(psmStores.map(store => store.loadStore()));

    let deletedEntities = 0;
    for (const psmStore of psmStores) {
        const result = await dataPsmGarbageCollection(psmStore);
        deletedEntities += result.deletedEntities;
    }
    const result = await pimGarbageCollection(pimStore, psmStores);
    deletedEntities += result.removedEntities;

    await pimStore.saveStore();
    await Promise.all(psmStores.map(store => store.saveStore()));

    response.send({
        deletedEntities,
    });
});

type ImportSpecifications = {
    store: Record<string, CoreResource>;
    dataSpecifications: Record<string, object>;
    specificationsToImport: Record<string, string>;
}

export const importSpecifications = asyncHandler(async (request: express.Request, response: express.Response) => {
    const data = request.body as ImportSpecifications;

    const postUpdate = [];
    for (const toImport of Object.keys(data.specificationsToImport)) {
        const type = data.specificationsToImport[toImport];
        if (type == "AS-IS") {
            await forceImportSpecification(data.dataSpecifications[toImport], data.store);
            postUpdate.push(data.dataSpecifications[toImport]);
        }
    }
    for (const specification of postUpdate) {
        await postUpdateSpecification(specification);
    }

    response.sendStatus(200);
});

async function forceImportSpecification(dataSpecification: any, store: Record<string, CoreResource>) {
    const pimStoreId = dataSpecification.pimStores[0].url.split('/').pop();
    await updateOrCreateStoreFromMerge(pimStoreId, dataSpecification.pim, store);


    let model = await dataSpecificationModel.getDataSpecification(dataSpecification.iri);
    if (!model) {
        model = await dataSpecificationModel.restoreDataSpecification(dataSpecification.iri, dataSpecification.pim, pimStoreId);
    }

    await dataSpecificationModel.modifyDataSpecification(dataSpecification.iri, {
       artefactConfiguration: dataSpecification.artefactConfiguration,
        //importsDataSpecifications: dataSpecification.importsDataSpecifications,
        tags: dataSpecification.tags,
        type: dataSpecification.type,
        cimAdapters: dataSpecification.cimAdapters,
    });

    for (const psm of dataSpecification.psms) {
        const storeId = dataSpecification.psmStores[psm][0].url.split('/').pop();
        await updateOrCreateStoreFromMerge(storeId, psm, store);

        await dataSpecificationModel.restoreDataStructure(dataSpecification.iri, psm, storeId);
    }
}

async function postUpdateSpecification(dataSpecification: any) {
    await dataSpecificationModel.modifyDataSpecification(dataSpecification.iri, {
        importsDataSpecifications: dataSpecification.importsDataSpecifications,
    });
}

async function updateOrCreateStoreFromMerge(storeId: string, schemaIri: string, mergedStore: Record<string, CoreResource>) {
    const root = mergedStore[schemaIri];
    const entities: string[] = [schemaIri];
    if (PimSchema.is(root)) {
        entities.push(...root.pimParts);
    } else if (DataPsmSchema.is(root)) {
        entities.push(...root.dataPsmParts);
    }

    const newObject: Record<string, CoreResource> = {};
    for (const entity of entities) {
        newObject[entity] = mergedStore[entity];
    }
    await storeModel.set(storeId, JSON.stringify({resources: newObject, operations: []}));
}

