import express from "express";
import {prisma, storeModel} from "../main";
import {v4 as uuidv4} from "uuid";

export const createDataPsm = async (request: express.Request, response: express.Response) => {
    const dataPsmStore = await storeModel.create();
    const dataPsm = await prisma.dataStructure.create({
        data: {
            id: uuidv4(),
            name: String(request.body.name),
            store: dataPsmStore,
            belongsToDataSpecification: {
                connect: {
                    id: request.params.specificationId
                }
            },
        },
    });
    await response.send(dataPsm);
}

const supportedArtifacts = ['xml', 'json'];

export const modifyDataPsm = async (request: express.Request, response: express.Response) => {
    // Data field for Prisma
    const data: any = {};

    if (Array.isArray(request.body.artifacts)) {
        for (const artifact of supportedArtifacts) {
            data["artifact_" + artifact] = request.body.artifacts.includes(artifact);
        }
    }

    try {
        await prisma.dataStructure.update({
            where: {
                id: request.params.dataPsmId
            },
            data,
        });
    } catch (clientValidationError) {
        response.status(400);
    }

    await response.sendStatus(204);
}

export const deleteDataPsm = async (request: express.Request, response: express.Response) => {
    const result = await prisma.dataStructure.delete({
        where: {
            id: request.params.dataPsmId,
        },
    })
    await storeModel.remove(result.store);
    response.sendStatus(204);
}

