import express from "express";
import {prisma, storeModel} from "../main";
import { v4 as uuidv4 } from 'uuid';

export const listSpecifications = async (request: express.Request, response: express.Response) => {
    response.send(JSON.stringify(await prisma.specification.findMany({include: {DataPsm: true}})));
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
    const specification = await prisma.specification.delete({
        where: {
            id: request.params.specificationId,
        },
    });
    await storeModel.remove(specification.pimStore);
    response.send(null);
}

export const modifySpecification = async (request: express.Request, response: express.Response) => {
    const specification = await prisma.specification.delete({
        where: {
            id: request.params.specificationId,
        },
    });
    response.send(null);
}
