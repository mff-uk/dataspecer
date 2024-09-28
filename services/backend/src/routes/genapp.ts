import z from "zod";
import express from "express";
import { asyncHandler } from "../utils/async-handler";
import { ApplicationGenerator, GenappInputArguments } from "@dataspecer/genapp";
import { resourceModel } from "../main";

export const getGeneratedApplication = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        zipname: z.string().min(1),
    });

    const query = querySchema.parse(request.query);

    if (!(request.body as string)) {
        response.status(400).json({ error: "Missing application graph" });
        return;
    }

    const inputArgs: GenappInputArguments = {
        serializedGraph: request.body.serializedGraph as string
    };

    try {
        const appGenerator = new ApplicationGenerator(inputArgs);
        const generatedApplicationZip = await appGenerator.generate();

        response.type("application/zip").send(generatedApplicationZip);
    } catch (error) {
        response.status(500).json({
            "message": "Unable to generate application",
            error
        });
    }
});

export const getGenerateApplicationByModelId = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const modelStore = await resourceModel.getOrCreateResourceModelStore(query.iri);
    const data = await modelStore.getJson();

    const inputArgs: GenappInputArguments = {
        serializedGraph: JSON.stringify(data)
    };

    const appGenerator = new ApplicationGenerator(inputArgs);
    const generatedApplicationZip = await appGenerator.generate();

    response.type("application/zip").send(generatedApplicationZip);
    return;
});
