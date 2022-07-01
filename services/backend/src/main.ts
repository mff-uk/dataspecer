// Load env variables in advance
require('dotenv-defaults').config({
    path: ".env.local",
    defaults: ".env",
});

import express from "express";
import { PrismaClient } from '@prisma/client';
import {
    addSpecification,
    deleteSpecification,
    listSpecifications,
    modifySpecification
} from "./routes/specification";
import {readStore, writeStore} from "./routes/store";
import {LocalStoreModel} from "./models/local-store-model";
import {createDataPsm, deleteDataPsm} from "./routes/dataPsm";
import cors from "cors";
import bodyParser from "body-parser";
import { generateBikeshedRoute } from "./routes/bikeshed";
import {DataSpecificationModel} from "./models/data-specification-model";
import {DataSpecificationWithStores} from "@dataspecer/backend-utils/interfaces/data-specification-with-stores";
import {convertLocalStoresToHttpStores} from "./utils/local-store-to-http-store";

// Create models

export const storeModel = new LocalStoreModel("./database/stores");
export const prismaClient = new PrismaClient();
export const dataSpecificationModel = new DataSpecificationModel(storeModel, prismaClient,"https://ofn.gov.cz/data-specification/{}");

export const storeApiUrl = process.env.HOST + '/store/{}';

let basename = new URL(process.env.HOST).pathname;
if (basename.endsWith('/')) {
    basename = basename.slice(0, -1);
}

export function replaceStoreDescriptorsInDataSpecification<T extends DataSpecificationWithStores>(dataSpecification: T): T {
    return {
        ...dataSpecification,
        pimStores: convertLocalStoresToHttpStores(dataSpecification.pimStores, storeApiUrl),
        psmStores: Object.fromEntries(Object.entries(dataSpecification.psmStores).map(entry => [entry[0], convertLocalStoresToHttpStores(entry[1], storeApiUrl)])),
    }
}

// Run express

const application = express();
application.use(cors());
application.use(bodyParser.json({limit: process.env.PAYLOAD_SIZE_LIMIT}));
application.use(bodyParser.urlencoded({ extended: false, limit: process.env.PAYLOAD_SIZE_LIMIT }));
application.use(bodyParser.urlencoded({ extended: true, limit: process.env.PAYLOAD_SIZE_LIMIT }));

application.get(basename + '/data-specification', listSpecifications);
application.post(basename + '/data-specification', addSpecification);
application.delete(basename + '/data-specification', deleteSpecification);
application.put(basename + '/data-specification', modifySpecification);

application.post(basename + '/data-specification/data-psm', createDataPsm);
application.delete(basename + '/data-specification/data-psm', deleteDataPsm);

// API for reading and writing store content.

application.get(basename + '/store/:storeId', readStore);
application.put(basename + '/store/:storeId', writeStore);

// API for generators

application.post(basename + '/transformer/bikeshed', bodyParser.text({type:"*/*", limit: process.env.PAYLOAD_SIZE_LIMIT}), generateBikeshedRoute);

application.listen(Number(process.env.PORT), () => {
    console.log(`Server is listening on port ${Number(process.env.PORT)}.`);
    console.log(`Try ${process.env.HOST}/data-specification for a list of data specifications. (should return "[]" for new instances)`);
});
