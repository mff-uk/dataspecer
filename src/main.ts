import express from "express";
import { PrismaClient } from '@prisma/client';
import {
    addSpecification,
    deleteSpecification,
    getSpecification,
    listSpecifications,
    modifySpecification
} from "./routes/specification";
import {readStore, writeStore} from "./routes/store";
import {StoreModel} from "./models/StoreModel";
import {createDataPsm, deleteDataPsm, modifyDataPsm} from "./routes/dataPsm";
import cors from "cors";
import {configurationByDataPsm, configurationBySpecification} from "./routes/configuration";
import bodyParser from "body-parser";

require('dotenv').config();

// Create models
// todo create specification model

export const storeModel = new StoreModel("./database/stores");
export const prisma = new PrismaClient();

// Run express

const application = express();
application.use(cors());
application.use(bodyParser.json({limit: process.env.PAYLOAD_SIZE_LIMIT}));
application.use(bodyParser.urlencoded({ extended: false, limit: process.env.PAYLOAD_SIZE_LIMIT }));
application.use(bodyParser.urlencoded({ extended: true, limit: process.env.PAYLOAD_SIZE_LIMIT }));

application.get('/specification', listSpecifications);
application.post('/specification', addSpecification);
application.get('/specification/:specificationId', getSpecification);
application.delete('/specification/:specificationId', deleteSpecification);
application.put('/specification/:specificationId', modifySpecification);

application.post('/specification/:specificationId/data-psm', createDataPsm);
application.post('/specification/:specificationId/data-psm/:dataPsmId', modifyDataPsm);
application.delete('/specification/:specificationId/data-psm/:dataPsmId', deleteDataPsm);

application.get('/store/:storeId', readStore);
application.put('/store/:storeId', writeStore);

application.get('/configuration/by-data-psm/:dataPsmId', configurationByDataPsm);
application.get('/configuration/by-specification/:specificationId', configurationBySpecification);

application.listen(Number(process.env.PORT), () =>
    console.log(`Server ready at: http://localhost:${Number(process.env.PORT)}`)
);
