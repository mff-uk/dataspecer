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
import {createDataPsm, deleteDataPsm} from "./routes/dataPsm";
import cors from "cors";
import {configurationByDataPsm} from "./routes/configuration";

require('dotenv').config();

// Create models
// todo create specification model

export const storeModel = new StoreModel("./database/stores");
export const prisma = new PrismaClient();

// Run express

const application = express();
application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cors());

application.get('/specification', listSpecifications);
application.post('/specification', addSpecification);
application.get('/specification/:specificationId', getSpecification);
application.delete('/specification/:specificationId', deleteSpecification);
application.put('/specification/:specificationId', modifySpecification);

application.post('/specification/:specificationId/data-psm', createDataPsm);
application.delete('/specification/:specificationId/data-psm/:dataPsmId', deleteDataPsm);

application.get('/store/:storeId', readStore);
application.put('/store/:storeId', writeStore);

application.get('/configuration/by-data-psm/:dataPsmId', configurationByDataPsm);

application.listen(Number(process.env.PORT), () =>
    console.log(`Server ready at: http://localhost:${Number(process.env.PORT)}`)
);
