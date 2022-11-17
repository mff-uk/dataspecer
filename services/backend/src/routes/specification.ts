import express from "express";
import {dataSpecificationModel, replaceStoreDescriptorsInDataSpecification} from "../main";
import {UpdateDataSpecification} from "@dataspecer/backend-utils/interfaces";
import {asyncHandler} from "../utils/async-handler";

export const listSpecifications = asyncHandler(async (request: express.Request, response: express.Response) => {
    if (request.query.dataSpecificationIri) {
        const iri = String(request.query.dataSpecificationIri);
        let spec = await dataSpecificationModel.getDataSpecification(iri);
        if (!spec) {
            response.status(404);
            return;
        }
        spec = replaceStoreDescriptorsInDataSpecification(spec);
        response.send(spec);
    } else {
        response.send((await dataSpecificationModel.getAllDataSpecifications()).map(replaceStoreDescriptorsInDataSpecification));
    }
});

export const addSpecification = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataToSet = request.body as UpdateDataSpecification;

    const specification = await dataSpecificationModel.createDataSpecification();
    const modifiedDataSpecification = await dataSpecificationModel.modifyDataSpecification(specification.iri as string, dataToSet);
    response.send(replaceStoreDescriptorsInDataSpecification(modifiedDataSpecification));
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
