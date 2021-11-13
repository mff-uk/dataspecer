import express from "express";
import { PrismaClient } from '@prisma/client';
import {addSpecification, deleteSpecification, listSpecifications, modifySpecification} from "./routes/specification";
import {readStore, writeStore} from "./routes/store";
import {StoreModel} from "./models/StoreModel";
import {createDataPsm, deleteDataPsm} from "./routes/dataPsm";

// Create models
// todo create specification model

export const storeModel = new StoreModel("./database/stores");
export const prisma = new PrismaClient();

// Run express

const application = express();
application.use(express.json());
application.use(express.urlencoded({ extended: true }));

application.get('/specification', listSpecifications);
application.post('/specification', addSpecification);
application.delete('/specification/:specificationId', deleteSpecification);
application.put('/specification/:specificationId', modifySpecification);

application.post('/specification/:specificationId/data-psm', createDataPsm);
application.delete('/specification/:specificationId/data-psm/:dataPsmId', deleteDataPsm);

application.get('/store/:storeId', readStore);
application.put('/store/:storeId', writeStore);

const arg = process.argv.slice(2);

application.listen(Number(arg[0]), () =>
    console.log(`Server ready at: http://localhost:${Number(arg[0])}`)
);
