import express from "express";
import { z } from "zod";
import { dataSpecificationModel, resourceModel, storeModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import configuration from "../configuration";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { DataSpecificationWithMetadata, DataSpecificationWithStores } from '@dataspecer/backend-utils/interfaces';
import { StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { LocalStoreDescriptor } from "../models/local-store-descriptor";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { LocalStore } from "../models/local-store";
import { ReadOnlyFederatedStore } from "@dataspecer/core/core/index";
import { DefaultArtifactBuilder } from "../generate/default-artifact-builder";

type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

interface DataSpecifications {
    [key: string]: FullDataSpecification;
}

export const generate = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const pckg = await resourceModel.getPackage(query.iri);

    if (!pckg) {
        response.status(404).send({error: "Package does not exist."});
        return;
    }

    const packagesToGenerate = [query.iri];
    const defaultConfiguration = configuration.configuration;
    const dataSpecifications = Object.fromEntries((await dataSpecificationModel.getAllDataSpecifications()).map(s => [s.iri, s])) as Record<string, FullDataSpecification>;

    const gatheredDataSpecifications: DataSpecifications = {};
    const toProcessDataSpecification = [...packagesToGenerate];

    for (let i = 0; i < toProcessDataSpecification.length; i++) {
        const dataSpecification = dataSpecifications[toProcessDataSpecification[i]];
        gatheredDataSpecifications[dataSpecification.iri as string] = dataSpecification;
        dataSpecification.importsDataSpecifications.forEach(importedDataSpecificationIri => {
            if (!toProcessDataSpecification.includes(importedDataSpecificationIri)) {
                toProcessDataSpecification.push(importedDataSpecificationIri);
            }
        });
    }

    // Gather all store descriptors

    const storeDescriptors = Object.values(gatheredDataSpecifications).reduce((acc, dataSpecification) => {
        return [...acc, ...dataSpecification.pimStores, ...Object.values(dataSpecification.psmStores).flat(1)];
    }, [] as StoreDescriptor[]);

    // Create stores or use the cache.

    const constructedStores: CoreResourceReader[] = [];

    for (const storeDescriptor of storeDescriptors) {
        const localStoreDescriptor = storeDescriptor as LocalStoreDescriptor;
        const store = new LocalStore(localStoreDescriptor, storeModel);
        await store.loadStore();
        constructedStores.push(store);
    }

    const federatedStore = ReadOnlyFederatedStore.createLazy(constructedStores);

    const generator = new DefaultArtifactBuilder(federatedStore, gatheredDataSpecifications, defaultConfiguration);
    await generator.prepare(Object.keys(gatheredDataSpecifications));
    const data = await generator.build();  

    // Send zip file
    response.type("application/zip").send(data);

    return;
});
