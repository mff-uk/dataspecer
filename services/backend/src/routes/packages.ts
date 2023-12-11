import { asyncHandler } from "../utils/async-handler";
import express from "express";
import { convertStores, packageModel, storeModel } from "../main";

export const getPackage = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    const pkg = await packageModel.getPackageWithChildren(packageId);
    response.send(pkg);
});

export const createPackage = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    const pkg = await packageModel.createPackage(packageId, request.body);

    response.send(pkg);
});

export const updatePackage = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    await packageModel.updatePackage(packageId, request.body);
    response.sendStatus(204);
});

export const deletePackage = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    await packageModel.deletePackage(packageId);
    response.sendStatus(204);
});

export const getSemanticModels = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    const models = await packageModel.getSemanticModels(packageId);
    response.send(models);
});

export const setSemanticModels = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    await packageModel.setSemanticModels(packageId, request.body);
    response.sendStatus(200);
});

export const createSemanticModel = asyncHandler(async (request: express.Request, response: express.Response) => {
    const packageId = request.query.packageId;
    if (typeof packageId !== "string" || !packageId) {
        response.sendStatus(400);
        return;
    }

    const [storeDescriptor] = convertStores([await storeModel.create()]);

    const models = await packageModel.getSemanticModels(packageId);
    models.push(storeDescriptor);
    await packageModel.setSemanticModels(packageId, models);
    response.send(storeDescriptor);
});
