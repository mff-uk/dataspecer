import express from "express";
import {prisma, storeModel} from "../main";
import {v4 as uuidv4} from "uuid";

export const createDataPsm = async (request: express.Request, response: express.Response) => {
    const dataPsmStore = await storeModel.create();
    const dataPsm = await prisma.dataPsm.create({
        data: {
            id: uuidv4(),
            name: String(request.body.name),
            store: dataPsmStore,
            specification: {
                connect: {
                    id: request.params.specificationId
                }
            },
        },
    });
    await response.send(dataPsm);
}

export const deleteDataPsm = async (request: express.Request, response: express.Response) => {
    const result = await prisma.dataPsm.delete({
        where: {
            id: request.params.dataPsmId,
        },
    })
    await storeModel.remove(result.store);
    response.sendStatus(204);
}

