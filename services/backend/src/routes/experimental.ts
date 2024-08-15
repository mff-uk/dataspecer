import { defaultConfiguration, generateDocumentation } from "@dataspecer/core-v2/documentation-generator";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { SemanticModelEntity, isSemanticModelClass, isSemanticModelRelationship } from "@dataspecer/core-v2/semantic-model/concepts";
import * as DataSpecificationVocabulary from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { PimStoreWrapper } from "@dataspecer/core-v2/semantic-model/v1-adapters";
import { simplifiedSemanticModelToSemanticModel } from "@dataspecer/core-v2/simplified-semantic-model";
import express from "express";
import { z } from "zod";
import { ZipStreamDictionary } from "../generate/zip-stream-dictionary";
import { resourceModel } from "../main";
import { asyncHandler } from "../utils/async-handler";
import { SemanticModelRelationship } from './../../../../packages/core-v2/lib/semantic-model/concepts/concepts.d';
import { isSemanticModelClassUsage, isSemanticModelRelationshipUsage, SemanticModelRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

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
    const conceptualModelIri = models[0]?.baseIri + "applicationProfileConceptualModel"; // We consider documentation URL as the IRI of the conceptual model.
    const contextModels = [];
    const modelForExport: DataSpecificationVocabulary.EntityListContainer = {
        baseIri: models[0]?.baseIri ?? "",
        entities: [],
    };
    for (const model of models.values()) {
        contextModels.push({
            baseIri: model.baseIri,
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
    const result = await generate(Object.values(entities), {baseIri: "", iri: ""});
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
    language?: string,
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

    return await generateDocumentation(context, {...defaultConfiguration, template, language: options.language ?? "en"});
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

    const convert = (iri: string | null) => (iri && !iri.includes("://")) ? (baseIri + iri) : iri;
    const result = {} as Record<string, SemanticModelEntity>;
    for (const [key, entity] of Object.entries(entities)) {
        if (isSemanticModelClass(entity) || isSemanticModelClassUsage(entity)) {
            result[key] = {
                ...entity,
                iri: convert(entity.iri),
            };
        } else if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
            result[key] = {
                ...entity,
                iri: convert(entity.iri),
                ends: entity.ends.map(end => ({
                    ...end,
                    iri: convert(end.iri),
                }),
                ),
            } as SemanticModelRelationship | SemanticModelRelationshipUsage;
        } else {
            result[key] = entity;
        }
    }
    return result;
}

class SingleFileStreamDictionary {
    requestedFileContents: string | null = null;
    constructor(private requestedFile: string) {}
    writePath(path: string) {
        return {
            write: async (data: string) => {
                if (path === this.requestedFile) {
                    this.requestedFileContents = data;
                }
            },
            close: () => Promise.resolve(),
        }
    }
}

async function generateArtifacts(packageIri: string, streamDictionary: SingleFileStreamDictionary, queryParams: string = "") {
    const resource = (await resourceModel.getPackage(packageIri))!;

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
                documentationUrl: pckg.userMetadata?.documentBaseUrl, //data.baseIri + "applicationProfileConceptualModel", //pckg.userMetadata?.documentBaseUrl,// ?? (isRoot ? "." : null),
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
    await fillModels(packageIri, true);

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

    const langs = ["cs", "en"];
    const writeFile = async (path: string, data: string) => {
        for (const lang of langs) {
            const file = streamDictionary.writePath(`${lang}/${path}`);
            await file.write(data);
            await file.close();
        }
    }

    const dsvMetadata: any = {
        "@id": "." + queryParams,
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
    // Todo: base iri and iri itself should be part of specification metadata
    const owl = await generateLightweightOwl(semanticModel, models[0].baseIri ?? "", models[0]?.baseIri ?? "");
    if (owl) {
        await writeFile("model.owl.ttl", owl);
        externalArtifacts["owl-vocabulary"] = [{type: "model.owl.ttl", URL: "./model.owl.ttl" + queryParams}];

        dsvMetadata["https://w3id.org/dsv#artefact"].push({
            "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
            "http://www.w3.org/ns/dx/prof/hasArtifact": [{
                "@id": "./model.owl.ttl" + queryParams,
            }],
            "http://www.w3.org/ns/dx/prof/hasRole": [{
                "@id": "http://www.w3.org/ns/dx/prof/role/vocabulary"
            }],
        });
    }

    // DSV
    const dsv = await generateDsv(models);
    if (dsv) {
        await writeFile("dsv.ttl", dsv);
        externalArtifacts["dsv-profile"] = [{type: "dsv.ttl", URL: "./dsv.ttl" + queryParams}];

        dsvMetadata["https://w3id.org/dsv#artefact"].push({
            "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
            "http://www.w3.org/ns/dx/prof/hasArtifact": [{
                "@id": "./dsv.ttl" + queryParams,
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
            await writeFile(`${visualModel.iri}.svg`, svg);
            externalArtifacts["svg"] = [...(externalArtifacts["svg"] ?? []), {type: "svg", URL: `./${visualModel.iri}.svg` + queryParams}];
        }
    }

    // HTML
    dsvMetadata["https://w3id.org/dsv#artefact"].push({
        "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
        "http://www.w3.org/ns/dx/prof/hasArtifact": [{
            "@id": "." + queryParams,
        }],
        "http://www.w3.org/ns/dx/prof/hasRole": [{
            "@id": "http://www.w3.org/ns/dx/prof/role/specification"
        }],
    });

    for (const lang of langs) {
        const documentation = streamDictionary.writePath(`${lang}/index.html`);
        await documentation.write(await getDocumentationData(packageIri, models, {externalArtifacts, dsv: dsvMetadata, language: lang}));
        await documentation.close();
    }
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

    const zip = new ZipStreamDictionary();

    await generateArtifacts(query.iri, zip as any);
    
    // Send zip file
    response.type("application/zip").send(await zip.save());
    return;
});

export const getSingleFile = asyncHandler(async (request: express.Request, response: express.Response) => {
    // The path does not start with slash.
    let path = request.params[0];
    if (path === "") {
        path = "index.html";
    }

    const querySchema = z.object({
        iri: z.string().min(1),
        // raw that anything non undefined is true
        raw: z.string().optional().transform(value => value !== undefined).pipe(z.boolean()),
    });
    const query = querySchema.parse(request.query);
    const resource = await resourceModel.getPackage(query.iri);
    if (!resource) {
        response.status(404).send({error: "Package does not exist."});
        return;
    }

    const streamDictionary = new SingleFileStreamDictionary(path);
    await generateArtifacts(query.iri, streamDictionary, query.raw ? "" : "?iri=" + encodeURIComponent(query.iri));

    if (streamDictionary.requestedFileContents === null) {
        response.status(404).send({error: "File not found."});
        return;
    } else {
        const type = path.split(".").pop() ?? "";
        switch (type) {
            case "html":
                response.type("text/html");
                break;
            case "ttl":
                response.type("text/turtle");
                break;
            case "svg":
                response.type("image/svg+xml");
                break;
            default:
                response.type("text/plain");
        }
        response.send(streamDictionary.requestedFileContents);
        return;
    }
});