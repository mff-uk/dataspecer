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
import {DataSpecificationWithStores} from "@model-driven-data/backend-utils/interfaces/data-specification-with-stores";
import {convertLocalStoresToHttpStores} from "./utils/local-store-to-http-store";

require('dotenv-defaults').config({
    path: ".env.local",
    defaults: ".env",
});

// Create models

export const storeModel = new LocalStoreModel("./database/stores");
export const prismaClient = new PrismaClient();
export const dataSpecificationModel = new DataSpecificationModel(storeModel, prismaClient,"https://ofn.gov.cz/data-specification/{}");

export const storeApiUrl = process.env.HOST + '/store/{}';

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

application.get('/data-specification', listSpecifications);
application.post('/data-specification', addSpecification);
application.delete('/data-specification', deleteSpecification);
application.put('/data-specification', modifySpecification);

application.post('/data-specification/data-psm', createDataPsm);
application.delete('/data-specification/data-psm', deleteDataPsm);

// API for reading and writing store content.

application.get('/store/:storeId', readStore);
application.put('/store/:storeId', writeStore);

// API for generators

application.post('/transformer/bikeshed', bodyParser.text({type:"*/*", limit: process.env.PAYLOAD_SIZE_LIMIT}), generateBikeshedRoute);

application.listen(Number(process.env.PORT), () =>
    console.log(`Server is listening on port ${Number(process.env.PORT)}`)
);

