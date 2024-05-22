import { LOCAL_SEMANTIC_MODEL } from "@dataspecer/core-v2/model/known-models";
import { resourceModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import express from "express";
import { z } from "zod";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { simplifiedSemanticModelToSemanticModel } from "@dataspecer/core-v2/simplified-semantic-model";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { generateDocumentation, defaultConfiguration } from "@dataspecer/core-v2/documentation-generator";

export const getLightweightOwl = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const resource = await resourceModel.getResource(query.iri);

    if (!resource) {
        response.status(404).send({error: "Resource does not exist."});
        return;
    }

    if (resource.types[0] !== LOCAL_SEMANTIC_MODEL) {
        response.status(400).send({error: "This type of resource is not supported."});
        return;
    }

    const data = await (await resourceModel.getOrCreateResourceModelStore(query.iri)).getJson();
    const entities = data.entities as Record<string, SemanticModelEntity>;

    const result = await generate(Object.values(entities));

    response.type("text/turtle").send(result);
    return;
});


export const getlightweightFromSimplified = asyncHandler(async (request: express.Request, response: express.Response) => {
    const entities = simplifiedSemanticModelToSemanticModel(request.body, {});
    const result = await generate(Object.values(entities));
    response.type("text/turtle").send(result);
    return;
});

export const getDocumentation = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const resource = await resourceModel.getPackage(query.iri);

    if (!resource) {
        response.status(404).send({error: "Package does not exist."});
        return;
    }

    const semanticModels = await Promise.all(resource.subResources.filter(r => r.types[0] === LOCAL_SEMANTIC_MODEL).map(async r => await (await resourceModel.getOrCreateResourceModelStore(r.iri)).getJson()));

    const context = {
        resourceModel,
        semanticModels: semanticModels.map(m => m.entities as Record<string, SemanticModelEntity>),
        modelIri: query.iri,
    };

    const result = await generateDocumentation(context, defaultConfiguration);

    response.type("text/html").send(result);
    return;
});