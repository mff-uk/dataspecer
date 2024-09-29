import z from "zod";
import express from "express";
import { resourceModel } from "../main";
import configuration from "../configuration";
import { asyncHandler } from "../utils/async-handler";
import { ApplicationGenerator, GenappConfiguration } from "@dataspecer/genapp";

export const getGeneratedApplication = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        zipname: z.string().min(1),
    });

    const query = querySchema.parse(request.query);

    if (!(request.body as string)) {
        response.status(400).json({ error: "Missing application graph" });
        return;
    }

    const inputArgs: GenappConfiguration = {
        serializedGraph: request.body.serializedGraph as string,
        backendHost: configuration.host,
        tmpOutDir: "generated",
        tmpOutZipname: "out.zip",
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

    const inputArgs: GenappConfiguration = {
        serializedGraph: JSON.stringify(data),
        backendHost: configuration.host,
        tmpOutDir: "generated",
        tmpOutZipname: "out.zip",
    };

    const appGenerator = new ApplicationGenerator(inputArgs);
    const generatedApplicationZip = await appGenerator.generate();

    response.type("application/zip").send(generatedApplicationZip);
    return;
});
