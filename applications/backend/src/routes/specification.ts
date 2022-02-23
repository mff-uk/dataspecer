import express from "express";
import {dataSpecificationModel, replaceStoreDescriptorsInDataSpecification} from "../main";
import {UpdateDataSpecification} from "@model-driven-data/backend-utils/interfaces/update-data-specification";
import {asyncHandler} from "../utils/async-handler";

export const listSpecifications = asyncHandler(async (request: express.Request, response: express.Response) => {
    response.send((await dataSpecificationModel.getAllDataSpecifications()).map(replaceStoreDescriptorsInDataSpecification));
});

export const addSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const specification = await dataSpecificationModel.createDataSpecification();
    response.send(replaceStoreDescriptorsInDataSpecification(specification));
});

export const deleteSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    await dataSpecificationModel.deleteDataSpecification(dataSpecificationIri);
    response.sendStatus(204);
});

export const modifySpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const dataToUpdate = request.body.update as UpdateDataSpecification;

    const modifiedDataSpecification = await dataSpecificationModel.modifyDataSpecification(dataSpecificationIri, dataToUpdate);
    response.send(replaceStoreDescriptorsInDataSpecification(modifiedDataSpecification));
});
