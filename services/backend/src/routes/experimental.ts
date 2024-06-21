import { LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { resourceModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import express from "express";
import { z } from "zod";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { simplifiedSemanticModelToSemanticModel } from "@dataspecer/core-v2/simplified-semantic-model";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { generateDocumentation, defaultConfiguration } from "@dataspecer/core-v2/documentation-generator";
import { ZipStreamDictionary } from "../generate/zip-stream-dictionary";
import { exportEntitiesAsDataSpecificationTrig } from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";

async function generateLightweightOwl(iri: string): Promise<string> {
    const resource = (await resourceModel.getResource(iri))!;
    const data = await (await resourceModel.getOrCreateResourceModelStore(iri)).getJson();
    const entities = data.entities as Record<string, SemanticModelEntity>;
    return await generate(Object.values(entities), {baseIri: data.baseIri});
}

async function generateDsv(iri: string): Promise<string> {
    const resource = (await resourceModel.getResource(iri))!;
    const data = await (await resourceModel.getOrCreateResourceModelStore(iri)).getJson();
    const entities = data.entities as Record<string, SemanticModelEntity>;
    return await exportEntitiesAsDataSpecificationTrig([{
        identifier: iri,
        alias: resource.userMetadata?.label?.["en"] ?? resource.userMetadata?.label?.["cs"] ?? "",
        entities: Object.values(entities),
    }]);
}

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

    response.type("text/turtle").send(await generateLightweightOwl(query.iri));
    return;
});


export const getlightweightFromSimplified = asyncHandler(async (request: express.Request, response: express.Response) => {
    const entities = simplifiedSemanticModelToSemanticModel(request.body, {});
    const result = await generate(Object.values(entities));
    response.type("text/turtle").send(result);
    return;
});

/**
 * Returns HTML documentation for the given package.
 */
async function getDocumentationData(packageId: string, options: {
    externalArtifacts?: Record<string, {
        type: string,
        URL: string,
    }[]>
} = {}): Promise<string> {
    const externalArtifacts = options.externalArtifacts ?? {};

    const resource = (await resourceModel.getPackage(packageId))!;
    const semanticModels = await Promise.all(resource.subResources.filter(r => r.types[0] === LOCAL_SEMANTIC_MODEL).map(async r => await (await resourceModel.getOrCreateResourceModelStore(r.iri)).getJson()));

    const customRespecTemplate = await resourceModel.getResourceModelStore(packageId, "respec");
    const template = customRespecTemplate ? (await customRespecTemplate.getJson()).value as string : defaultConfiguration.template;

    const context = {
        resourceModel,
        semanticModels: semanticModels.map(m => m.entities as Record<string, SemanticModelEntity>),
        modelIri: packageId,
        externalArtifacts,
    };

    return await generateDocumentation(context, {...defaultConfiguration, template});
}

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

    response.type("text/html").send(await getDocumentationData(query.iri));
    return;
});

export const getZip = asyncHandler(async (request: express.Request, response: express.Response) => {
    const querySchema = z.object({
        iri: z.string().min(1),
    });
    const query = querySchema.parse(request.query);

    const resource = await resourceModel.getPackage(query.iri);

    if (!resource) {
        response.status(404).send({error: "Package does not exist."});
        return;
    }

    // Find all semantic models
    const semanticModels = resource.subResources.filter(r => r.types[0] === LOCAL_SEMANTIC_MODEL);

    // External artifacts for the documentation
    const externalArtifacts: Record<string, {
        type: string,
        URL: string,
    }[]> = {};

    const zip = new ZipStreamDictionary();
    
    // OWL
    const owl = await generateLightweightOwl(semanticModels[0].iri);
    if (owl) {
        const owlFile = zip.writePath("model.owl");
        await owlFile.write(owl);
        await owlFile.close();
        externalArtifacts["owl-vocabulary"] = [{type: "model.owl", URL: "./model.owl"}];
    }
    
    // DSV
    const dsv = await generateDsv(semanticModels[0].iri);
    if (dsv) {
        const dsvFile = zip.writePath("dsv.ttl");
        await dsvFile.write(dsv);
        await dsvFile.close();
        externalArtifacts["dsv-profile"] = [{type: "dsv.ttl", URL: "./dsv.ttl"}];
    }
    
    // All SVGs
    const visualModels = resource.subResources.filter(r => r.types[0] === LOCAL_VISUAL_MODEL);
    for (const visualModel of visualModels) {
        const svgModel = await resourceModel.getResourceModelStore(visualModel.iri, "svg");
        const svg = svgModel ? (await svgModel.getJson()).svg as string : null;
        
        if (svg) {
            const svgFile = zip.writePath(`${visualModel.iri}.svg`);
            await svgFile.write(svg);
            await svgFile.close();
            externalArtifacts["svg"] = [...(externalArtifacts["svg"] ?? []), {type: "svg", URL: `./${visualModel.iri}.svg`}];
        }
    }

    // HTML
    const documentation = zip.writePath("index.html");
    await documentation.write(await getDocumentationData(query.iri, {externalArtifacts}));
    await documentation.close();

    // Send zip file
    response.type("application/zip").send(await zip.save());
    return;
});