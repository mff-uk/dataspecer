import { SemanticModelClass, SemanticModelRelationship } from './../../../../packages/core-v2/lib/semantic-model/concepts/concepts.d';
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { resourceModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import express from "express";
import { z } from "zod";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import { simplifiedSemanticModelToSemanticModel } from "@dataspecer/core-v2/simplified-semantic-model";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { generateDocumentation, defaultConfiguration } from "@dataspecer/core-v2/documentation-generator";
import { ZipStreamDictionary } from "../generate/zip-stream-dictionary";
import * as DataSpecificationVocabulary from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import { PimStoreWrapper } from "@dataspecer/core-v2/semantic-model/v1-adapters";

interface ModelDescription {
    isPrimary: boolean;
    documentationUrl: string | null;
    entities: Record<string, SemanticModelEntity>;
    baseIri: string | null;
}

async function generateLightweightOwl(entities: Record<string, SemanticModelEntity>, baseIri: string, iri: string): Promise<string> {
    // @ts-ignore
    return await generate(Object.values(entities), {baseIri, iri});
}

async function generateDsv(models: ModelDescription[]): Promise<string> {
    // We collect all models as context and all entities for export.
    const conceptualModelIri = ""; // THIS is IRI used for the ConceptualModel.
    const contextModels = [];
    const modelForExport: DataSpecificationVocabulary.EntityListContainer = {
        baseIri: null, // TODO Get base URL.
        entities: [],
    };
    for (const model of models.values()) {
        contextModels.push({
            baseIri: null, // TODO Get base URL.
            entities: Object.values(model.entities),
        });
        Object.values(model.entities).forEach(entity => modelForExport.entities.push(entity));
    }
    // Create context.
    const context = DataSpecificationVocabulary.createContext(contextModels, value => value ?? null);
    //
    const conceptualModel = DataSpecificationVocabulary.entityListContainerToConceptualModel(
        conceptualModelIri, modelForExport, context);
    return await DataSpecificationVocabulary.conceptualModelToRdf(conceptualModel, { prettyPrint: true });
}

export const getLightweightOwl = asyncHandler(async (request: express.Request, response: express.Response) => {
    // const querySchema = z.object({
    //     iri: z.string().min(1),
    // });
    // const query = querySchema.parse(request.query);

    // const resource = await resourceModel.getResource(query.iri);

    // if (!resource) {
    //     response.status(404).send({error: "Resource does not exist."});
    //     return;
    // }

    // if (resource.types[0] !== LOCAL_SEMANTIC_MODEL) {
    //     response.status(400).send({error: "This type of resource is not supported."});
    //     return;
    // }

    // response.type("text/turtle").send(await generateLightweightOwl(query.iri));
    // return;
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
async function getDocumentationData(packageId: string, models: ModelDescription[], options: {
    externalArtifacts?: Record<string, {
        type: string,
        URL: string,
    }[]>,
    dsv?: any,
} = {}): Promise<string> {
    const externalArtifacts = options.externalArtifacts ?? {};

    const resource = (await resourceModel.getPackage(packageId))!;

    const customRespecTemplate = await resourceModel.getResourceModelStore(packageId, "respec");
    const template = customRespecTemplate ? (await customRespecTemplate.getJson()).value as string : defaultConfiguration.template;

    const context = {
        resourceModel,
        models,
        modelIri: packageId,
        externalArtifacts,
        dsv: options.dsv
    };

    return await generateDocumentation(context, {...defaultConfiguration, template});
}

export const getDocumentation = asyncHandler(async (request: express.Request, response: express.Response) => {
    // const querySchema = z.object({
    //     iri: z.string().min(1),
    // });
    // const query = querySchema.parse(request.query);

    // const resource = await resourceModel.getPackage(query.iri);

    // if (!resource) {
    //     response.status(404).send({error: "Package does not exist."});
    //     return;
    // }

    // response.type("text/html").send(await getDocumentationData(query.iri));
    // return;
});

function absoluteIri(baseIri: string, entities: Record<string, SemanticModelEntity>): Record<string, SemanticModelEntity> {
    if (!baseIri) {
        return entities;
    }

    const convert = (iri: string | null) => iri ? new URL(iri, baseIri).toString() : null;
    const result = {} as Record<string, SemanticModelEntity>;
    for (const [key, entity] of Object.entries(entities)) {
        if (isSemanticModelClass(entity)) {
            result[key] = {
                ...entity,
                iri: convert(entity.iri),
            };
        } else if (isSemanticModelRelationship(entity)) {
            result[key] = {
                ...entity,
                iri: convert(entity.iri),
                ends: entity.ends.map(end => ({
                    ...end,
                    iri: convert(end.iri),
                }),
                ),
            } as SemanticModelRelationship;
        } else {
            result[key] = entity;
        }
    }
    return result;
}

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

    // Find all models recursively and store them with their metadata
    const models = [] as ModelDescription[];
    async function fillModels(packageIri: string, isRoot: boolean = false) {
        const pckg = await resourceModel.getPackage(packageIri);
        if (!pckg) {
            throw new Error("Package does not exist.");
        }
        const semanticModels = pckg.subResources.filter(r => r.types[0] === LOCAL_SEMANTIC_MODEL);
        for (const model of semanticModels) {
            const data = await (await resourceModel.getOrCreateResourceModelStore(model.iri)).getJson();
            models.push({
                entities: absoluteIri(data.baseIri, data.entities),
                isPrimary: isRoot,
                // @ts-ignore
                documentationUrl: pckg.userMetadata?.documentBaseUrl ?? (isRoot ? "." : null),
                baseIri: data.baseIri,
            });
        }
        const pimModels = pckg.subResources.filter(r => r.types[0] === "https://dataspecer.com/core/model-descriptor/pim-store-wrapper");
        for (const model of pimModels) {
            const data = await (await resourceModel.getOrCreateResourceModelStore(model.iri)).getJson();
            const constructedModel = new PimStoreWrapper(data.pimStore, data.id, data.alias);
            await constructedModel.fetchFromPimStore();
            const entities = constructedModel.getEntities() as Record<string, SemanticModelEntity>;
            models.push({
                entities,
                isPrimary: false,
                // @ts-ignore
                documentationUrl: model.userMetadata?.documentBaseUrl ?? null,
                baseIri: null
            });
        }
        const packages = pckg.subResources.filter(r => r.types[0] === LOCAL_PACKAGE);
        for (const p of packages) {
            await fillModels(p.iri);
        }
    }
    await fillModels(query.iri, true);

    // Get used vocabularies
    const usedVocabularies = new Set<string>();
    for (const model of resource.subResources) {
        if (model.types[0] === "https://dataspecer.com/core/model-descriptor/pim-store-wrapper") {
            const data = await (await resourceModel.getOrCreateResourceModelStore(model.iri)).getJson();
            if (data.urls) {
                for (const url of data.urls) {
                    usedVocabularies.add(url);
                }
            }
        }
        if (model.types[0] === LOCAL_PACKAGE) {
            // @ts-ignore
            const imported = model.userMetadata?.importedFromUrl as string | undefined;
            if (imported) {
                usedVocabularies.add(imported);
            }
        }
    }

    // Primary semantic model
    const semanticModel = {};
    for (const model of models) {
        if (model.isPrimary) {
            Object.assign(semanticModel, model.entities);
        }
    }

    // External artifacts for the documentation
    const externalArtifacts: Record<string, {
        type: string,
        URL: string,
    }[]> = {};

    const zip = new ZipStreamDictionary();

    const dsvMetadata: any = {
        "@id": ".",
        "@type": ["http://purl.org/dc/terms/Standard", "http://www.w3.org/2002/07/owl#Ontology"],
        "http://purl.org/dc/terms/title":
            Object.entries(resource.userMetadata?.label ?? {}).map(([lang, value]) => (
            {
                "@language": lang,
                "@value": value,
            })),
        "https://w3id.org/dsv#artefact": [],
        "https://w3id.org/dsv#usedVocabularies" : [[...usedVocabularies].map(v => ({"@id": v}))],
    };

    // OWL
    const owl = await generateLightweightOwl(semanticModel, models[0].baseIri ?? "", models[0].baseIri ?? "");
    if (owl) {
        const owlFile = zip.writePath("model.owl");
        await owlFile.write(owl);
        await owlFile.close();
        externalArtifacts["owl-vocabulary"] = [{type: "model.owl", URL: "./model.owl"}];

        dsvMetadata["https://w3id.org/dsv#artefact"].push({
            "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
            "http://www.w3.org/ns/dx/prof/hasArtifact": [{
                "@id": "./model.owl",
            }],
            "http://www.w3.org/ns/dx/prof/hasRole": [{
                "@id": "http://www.w3.org/ns/dx/prof/role/vocabulary"
            }],
        });
    }

    // DSV
    const dsv = await generateDsv(models);
    if (dsv) {
        const dsvFile = zip.writePath("dsv.ttl");
        await dsvFile.write(dsv);
        await dsvFile.close();
        externalArtifacts["dsv-profile"] = [{type: "dsv.ttl", URL: "./dsv.ttl"}];

        dsvMetadata["https://w3id.org/dsv#artefact"].push({
            "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
            "http://www.w3.org/ns/dx/prof/hasArtifact": [{
                "@id": "./dsv.ttl",
            }],
            "http://www.w3.org/ns/dx/prof/hasRole": [{
                "@id": "http://www.w3.org/ns/dx/prof/role/schema"
            }],
        });
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
    dsvMetadata["https://w3id.org/dsv#artefact"].push({
        "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
        "http://www.w3.org/ns/dx/prof/hasArtifact": [{
            "@id": ".",
        }],
        "http://www.w3.org/ns/dx/prof/hasRole": [{
            "@id": "http://www.w3.org/ns/dx/prof/role/specification"
        }],
    });
    const documentation = zip.writePath("index.html");
    await documentation.write(await getDocumentationData(query.iri, models, {externalArtifacts, dsv: dsvMetadata}));
    await documentation.close();

    // Send zip file
    response.type("application/zip").send(await zip.save());
    return;
});