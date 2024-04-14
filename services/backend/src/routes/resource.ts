import { resourceModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import express from "express";
import { z } from "zod";

export const getResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const resource = await resourceModel.getResource(query.iri);

    if (!resource) {
        response.sendStatus(404);
        return;
    }

    response.send(resource);
});

export const createResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        parentIri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const bodySchema = z.object({
        iri: z.string().min(1),
        type: z.string().min(1),
        userMetadata: z.optional(z.record(z.unknown())),
    }).strict();
    const body = bodySchema.parse(request.body);

    await resourceModel.createResource(query.parentIri, body.iri, body.type, body.userMetadata ?? {});

    response.send(await resourceModel.getResource(body.iri));
});

export const updateResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const bodySchema = z.object({
        userMetadata: z.optional(z.record(z.unknown())),
    }).strict();
    const body = bodySchema.parse(request.body);

    if (body.userMetadata) {
        await resourceModel.updateResource(query.iri, body.userMetadata);
    }

    response.send(await resourceModel.getResource(query.iri));
});

export const deleteResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const iri = request.query.iri;
    if (typeof iri !== "string" || !iri) {
        response.sendStatus(400);
        return;
    }

    await resourceModel.deleteResource(iri);
    response.status(200);
});


export const getBlob = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
        name: z.string().min(1).default("model"),
    });
    const query = querySchema.parse(request.query);

    const buffer = await (await resourceModel.getOrCreateResourceModelStore(query.iri, query.name)).getBuffer();

    response.send(buffer);
});

export const updateBlob = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
        name: z.string().min(1).default("model"),
    });
    const query = querySchema.parse(request.query);

    const buffer = await (await resourceModel.getOrCreateResourceModelStore(query.iri, query.name)).setJson(request.body);
    response.sendStatus(200);
});

export const deleteBlob = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
        name: z.string().min(1).default("model"),
    });
    const query = querySchema.parse(request.query);

    await resourceModel.deleteModelStore(query.iri, query.name);
    response.sendStatus(200);
});

export const getPackageResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const resource = await resourceModel.getPackage(query.iri);

    if (!resource) {
        response.sendStatus(404);
        return;
    }

    response.send(resource);
});

export const createPackageResource = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        parentIri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const bodySchema = z.object({
        iri: z.string().min(1),
        userMetadata: z.optional(z.record(z.unknown())),
    }).strict();
    const body = bodySchema.parse(request.body);

    await resourceModel.createPackage(query.parentIri, body.iri, body.userMetadata ?? {});

    response.send(await resourceModel.getPackage(body.iri));
});

export const getRootPackages = asyncHandler(async (request: express.Request, response: express.Response) => {
    response.send(await resourceModel.getRootResources());
});