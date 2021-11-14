import express from "express";
import {prisma, storeModel} from "../main";
import { v4 as uuidv4 } from 'uuid';

export const listSpecifications = async (request: express.Request, response: express.Response) => {
    response.send(JSON.stringify(await prisma.specification.findMany({include: {DataPsm: true}})));
}

export const getSpecification = async (request: express.Request, response: express.Response) => {
    response.send(JSON.stringify(await prisma.specification.findFirst({
        where: {
            id: request.params.specificationId,
        },
        include: {DataPsm: true, linkedSpecification: true}
    })));
}

export const addSpecification = async (request: express.Request, response: express.Response) => {
    const pimStore = await storeModel.create();

    const specification = await prisma.specification.create({
        data: {
            id: uuidv4(),
            pimStore: pimStore,
            name: String(request.body.name),
        }
    });

    response.send(JSON.stringify(specification));
}

export const deleteSpecification = async (request: express.Request, response: express.Response) => {
    const allDataPsm = await prisma.dataPsm.findMany({
        where: {
            specification: {
                id: request.params.specificationId
            }
        }
    });

    allDataPsm.forEach(dataPsm => storeModel.remove(dataPsm.store));

    await prisma.dataPsm.deleteMany({
        where: {
            specification: {
                id: request.params.specificationId,
            }
        }
    });

    const specification = await prisma.specification.delete({
        where: {
            id: request.params.specificationId,
        },
    });
    storeModel.remove(specification.pimStore).then(() => {});

    response.send(null);
}

export const modifySpecification = async (request: express.Request, response: express.Response) => {
    if (request.body.linkedSpecifications) {
        await prisma.specification.update({
            where: {
                id: request.params.specificationId,
            },
            data: {
                linkedSpecification: {
                    set: request.body.linkedSpecifications.map((id: string) => ({id}))
                }
            }
        });
    }

    response.send(null);
}
