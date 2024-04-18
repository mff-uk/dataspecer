import express from "express";
import { dataSpecificationModel } from "../main";
import { replaceStoreDescriptorsInDataSpecification } from "../models/data-specification-model-adapted";
import { asyncHandler } from "../utils/async-handler";

export const createDataPsm = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const result = await dataSpecificationModel.createDataStructure(dataSpecificationIri);
    response.send({
        dataSpecification: replaceStoreDescriptorsInDataSpecification(result.dataSpecification),
        createdPsmSchemaIri: result.createdPsmSchemaIri
    });
});

export const deleteDataPsm = asyncHandler(async (request: express.Request, response: express.Response) => {
    const dataSpecificationIri = String(request.body.dataSpecificationIri);
    const dataPsmSchemaIri = String(request.body.dataPsmSchemaIri);
    await dataSpecificationModel.deleteDataStructure(dataSpecificationIri, dataPsmSchemaIri);
    response.sendStatus(204);
});
