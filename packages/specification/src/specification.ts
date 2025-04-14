import { createDefaultConfigurationModelFromJsonObject } from "@dataspecer/core-v2/configuration-model";
import { LOCAL_PACKAGE, LOCAL_SEMANTIC_MODEL, LOCAL_VISUAL_MODEL } from "@dataspecer/core-v2/model/known-models";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import * as DataSpecificationVocabulary from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { createSgovModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { withAbsoluteIri } from "@dataspecer/core-v2/semantic-model/utils";
import { PimStoreWrapper } from "@dataspecer/core-v2/semantic-model/v1-adapters";
import { LanguageString } from "@dataspecer/core/core/core-resource";
import { HttpFetch } from "@dataspecer/core/io/fetch/fetch-api";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import { getMustacheView } from "@dataspecer/documentation";
import { createPartialDocumentationConfiguration, DOCUMENTATION_MAIN_TEMPLATE_PARTIAL } from "@dataspecer/documentation/configuration";
import { generateDocumentation } from "@dataspecer/documentation/documentation-generator";
import { mergeDocumentationConfigurations } from "./documentation/index.ts";
import { BlobModel, ModelRepository } from "./model-repository/index.ts";

interface ModelDescription {
  isPrimary: boolean;
  documentationUrl: string | null;
  entities: Record<string, SemanticModelEntity>;
  baseIri: string | null;
}

async function generateLightweightOwl(entities: Record<string, SemanticModelEntity>, baseIri: string, iri: string): Promise<string> {
  // @ts-ignore
  return await generate(Object.values(entities), { baseIri, iri });
}

async function generateDsv(models: ModelDescription[]): Promise<string> {
  // We collect all models as context and all entities for export.
  const conceptualModelIri = models[0]?.baseIri + "applicationProfileConceptualModel"; // We consider documentation URL as the IRI of the conceptual model.
  const contextModels: DataSpecificationVocabulary.EntityListContainer[] = [];
  const modelForExport: DataSpecificationVocabulary.EntityListContainer = {
    baseIri: "",
    entities: [],
  };
  for (const model of models.values()) {
    contextModels.push({
      baseIri: model.baseIri ?? "",
      entities: Object.values(model.entities),
    });
    if (model.isPrimary) {
      modelForExport.baseIri = model.baseIri ?? "";
      Object.values(model.entities).forEach((entity) => modelForExport.entities.push(entity));
    }
  }
  // Create context.
  const context = DataSpecificationVocabulary.createContext(contextModels);
  //
  const conceptualModel = DataSpecificationVocabulary.entityListContainerToConceptualModel(conceptualModelIri, modelForExport, context);
  return await DataSpecificationVocabulary.conceptualModelToRdf(conceptualModel, { prettyPrint: true });
}

/**
 * Returns HTML documentation for the given package.
 */
async function getDocumentationData(
  thisPackageModel: BlobModel,
  models: ModelDescription[],
  options: {
    externalArtifacts?: Record<
      string,
      {
        type: string;
        URL: string;
      }[]
    >;
    dsv?: any;
    language?: string;
    prefixMap?: Record<string, string>;
  } = {},
  generatorContext: GenerateSpecificationContext
): Promise<string> {
  const externalArtifacts = options.externalArtifacts ?? {};

  const packageData = await thisPackageModel.getJsonBlob();
  const configuration = createDefaultConfigurationModelFromJsonObject(packageData as object);
  const documentationConfiguration = createPartialDocumentationConfiguration(configuration);
  const fullConfiguration = mergeDocumentationConfigurations([documentationConfiguration]);

  const context = {
    label: thisPackageModel.getUserMetadata().label ?? {},
    models,
    externalArtifacts,
    dsv: options.dsv,
    prefixMap: options.prefixMap ?? {},
  };

  return await generateDocumentation(context, {
    template: fullConfiguration.partials[DOCUMENTATION_MAIN_TEMPLATE_PARTIAL]!,
    language: options.language ?? "en",
    partials: fullConfiguration.partials,
  }, generatorContext.v1Context ? adapter => getMustacheView(
    {
      context: generatorContext.v1Context,
      specification: generatorContext.v1Specification,
      artefact: generatorContext.v1Specification.artefacts.find((a: any) => a.generator === "https://schemas.dataspecer.com/generator/template-artifact"),
    },
    adapter,
  ) : undefined);
}

export interface GenerateSpecificationContext {
  modelRepository: ModelRepository;
  output: StreamDictionary;

  fetch: HttpFetch;

  v1Context?: any;
  v1Specification?: any;
}

export interface GenerateSpecificationOptions {
  /**
   * Generate only a single file specified by this local path.
   */
  singleFilePath?: string;

  /**
   * String that will be appended to the generated file paths.
   * @example ?specification=iri
   */
  queryParams?: string;

  /**
   * Whether to generate output to a subdirectory.
   * Must end with a slash.
   */
  subdirectory?: string;
}










export async function generateSpecification(packageId: string, context: GenerateSpecificationContext, options: GenerateSpecificationOptions = {}): Promise<void> {
  const subdirectory = options.subdirectory ?? "";
  const queryParams = options.queryParams ?? "";

  const model = (await context.modelRepository.getModelById(packageId))!;
  const resource = await model.asPackageModel();
  const subResources = await resource.getSubResources();

  const prefixMap = {} as Record<string, string>;

  // Find all models recursively and store them with their metadata
  const models = [] as ModelDescription[];
  async function fillModels(packageIri: string, isRoot: boolean = false) {
    const model = (await context.modelRepository.getModelById(packageIri))!;
    const pckg = await model.asPackageModel();
    if (!pckg) {
      throw new Error("Package does not exist.");
    }
    const subResources = await pckg.getSubResources();
    const semanticModels = subResources.filter((r) => r.types[0] === LOCAL_SEMANTIC_MODEL);
    for (const model of semanticModels) {
      const data = await (await model.asBlobModel()).getJsonBlob() as any;

      const modelName = model.getUserMetadata()?.label?.en ?? model.getUserMetadata()?.label?.cs;
      if (modelName && modelName.length > 0 && modelName.match(/^[a-z]+$/)) {
        prefixMap[data.baseIri] = modelName;
      }

      models.push({
        entities: Object.fromEntries(Object.entries(data.entities).map(([id, entity]) => [id, withAbsoluteIri(entity as SemanticModelEntity, data.baseIri)])),
        isPrimary: isRoot,
        documentationUrl: (pckg.getUserMetadata() as any)?.documentBaseUrl, //data.baseIri + "applicationProfileConceptualModel", //pckg.userMetadata?.documentBaseUrl,// ?? (isRoot ? "." : null),
        baseIri: data.baseIri,
      });
    }
    const sgovModels = subResources.filter((r) => r.types[0] === "https://dataspecer.com/core/model-descriptor/sgov");
    for (const sgovModel of sgovModels) {
      const model = createSgovModel("https://slovník.gov.cz/sparql", context.fetch, sgovModel.id);
      const blobModel = await sgovModel.asBlobModel();
      const data = await blobModel.getJsonBlob() as any;
      await model.unserializeModel(data);
      models.push({
        entities: model.getEntities() as Record<string, SemanticModelEntity>,
        isPrimary: false,
        documentationUrl: null,
        baseIri: null,
      });
    }
    const pimModels = subResources.filter((r) => r.types[0] === "https://dataspecer.com/core/model-descriptor/pim-store-wrapper");
    for (const model of pimModels) {
      const blobModel = await model.asBlobModel();
      const data = await blobModel.getJsonBlob() as any;
      const constructedModel = new PimStoreWrapper(data.pimStore, data.id, data.alias);
      constructedModel.fetchFromPimStore();
      const entities = constructedModel.getEntities() as Record<string, SemanticModelEntity>;
      models.push({
        entities,
        isPrimary: false,
        // @ts-ignore
        documentationUrl: model.userMetadata?.documentBaseUrl ?? null,
        baseIri: null,
      });
    }
    const packages = subResources.filter((r) => r.types[0] === LOCAL_PACKAGE);
    for (const p of packages) {
      await fillModels(p.id);
    }
  }
  await fillModels(packageId, true);

  // Get used vocabularies
  const usedVocabularies = new Set<string>();
  for (const model of subResources) {
    if (model.types[0] === "https://dataspecer.com/core/model-descriptor/pim-store-wrapper") {
      const blobModel = await model.asBlobModel();
      const data = await blobModel.getJsonBlob() as any;
      if (data.urls) {
        for (const url of data.urls) {
          usedVocabularies.add(url);
        }
      }
    }
    if (model.types[0] === LOCAL_PACKAGE) {

      const imported = (model.getUserMetadata() as any)?.importedFromUrl as string | undefined;
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
  const externalArtifacts: Record<
    string,
    {
      type: string;
      URL: string;
      label?: LanguageString;
    }[]
  > = {};

  const langs = ["cs", "en"];
  const writeFile = async (path: string, data: string) => {
    for (const lang of langs) {
      const file = context.output.writePath(`${subdirectory}${lang}/${path}`);
      await file.write(data);
      await file.close();
    }
  };

  const dsvMetadata: any = {
    "@id": options.queryParams ?? ".",
    "@type": ["http://purl.org/dc/terms/Standard", "http://www.w3.org/2002/07/owl#Ontology"],
    "http://purl.org/dc/terms/title": Object.entries(resource.getUserMetadata()?.label ?? {}).map(([lang, value]) => ({
      "@language": lang,
      "@value": value,
    })),
    "https://w3id.org/dsv#artefact": [],
    "http://www.w3.org/ns/dx/prof/hasResource": [],
    "http://purl.org/dc/terms/references": [[...usedVocabularies].map((v) => ({ "@id": v }))], //TODO: remove when every known instance is updated to prof:isProfileOf
    "http://www.w3.org/ns/dx/prof/isProfileOf": [[...usedVocabularies].map((v) => ({ "@id": v }))],
  };

  // OWL
  if (models.length > 0) {
    // Todo: base iri and iri itself should be part of specification metadata
    const firstModel = models[0]!;
    const owl = await generateLightweightOwl(semanticModel, firstModel.baseIri ?? "", firstModel?.baseIri ?? "");
    if (owl) {
      await writeFile("model.owl.ttl", owl);
      externalArtifacts["owl-vocabulary"] = [{ type: "model.owl.ttl", URL: "./model.owl.ttl" + queryParams }];

      dsvMetadata["https://w3id.org/dsv#artefact"].push({ //TODO: remove when every known instance is updated to prof:hasResource
        "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
        "http://www.w3.org/ns/dx/prof/hasArtifact": [
          {
            "@id": "./model.owl.ttl" + queryParams,
          },
        ],
        "http://www.w3.org/ns/dx/prof/hasRole": [
          {
            "@id": "http://www.w3.org/ns/dx/prof/role/vocabulary",
          },
        ],
      });
      dsvMetadata["http://www.w3.org/ns/dx/prof/hasResource"].push({
        "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
        "http://www.w3.org/ns/dx/prof/hasArtifact": [
          {
            "@id": "./model.owl.ttl" + queryParams,
          },
        ],
        "http://www.w3.org/ns/dx/prof/hasRole": [
          {
            "@id": "http://www.w3.org/ns/dx/prof/role/vocabulary",
          },
        ],
      });
    }
  }

  // DSV
  const dsv = await generateDsv(models);
  if (dsv) {
    await writeFile("dsv.ttl", dsv);
    externalArtifacts["dsv-profile"] = [{ type: "dsv.ttl", URL: "./dsv.ttl" + queryParams }];

    dsvMetadata["https://w3id.org/dsv#artefact"].push({ //TODO: remove when every known instance is updated to prof:hasResource
      "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
      "http://www.w3.org/ns/dx/prof/hasArtifact": [
        {
          "@id": "./dsv.ttl" + queryParams,
        },
      ],
      "http://www.w3.org/ns/dx/prof/hasRole": [
        {
          "@id": "http://www.w3.org/ns/dx/prof/role/schema",
        },
      ],
    });
    dsvMetadata["http://www.w3.org/ns/dx/prof/hasResource"].push({
      "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
      "http://www.w3.org/ns/dx/prof/hasArtifact": [
        {
          "@id": "./dsv.ttl" + queryParams,
        },
      ],
      "http://www.w3.org/ns/dx/prof/hasRole": [
        {
          "@id": "http://www.w3.org/ns/dx/prof/role/schema",
        },
      ],
    });
  }

  // All SVGs
  const visualModels = subResources.filter((r) => r.types[0] === LOCAL_VISUAL_MODEL);
  for (const visualModel of visualModels) {
    const model = await visualModel.asBlobModel();
    const svgModel = await model.getJsonBlob("svg");
    const svg = svgModel ? (svgModel as {svg: string}).svg : null;

    if (svg) {
      await writeFile(`${visualModel.id}.svg`, svg);
      externalArtifacts["svg"] = [...(externalArtifacts["svg"] ?? []), {
        type: "svg",
        URL: `./${visualModel.id}.svg` + queryParams,
        label: visualModel.getUserMetadata()?.label,
      }];
    }
  }

  // HTML
  dsvMetadata["https://w3id.org/dsv#artefact"].push({ //TODO: remove when every known instance is updated to prof:hasResource
    "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
    "http://www.w3.org/ns/dx/prof/hasArtifact": [
      {
        "@id": options.queryParams ?? ".",
      },
    ],
    "http://www.w3.org/ns/dx/prof/hasRole": [
      {
        "@id": "http://www.w3.org/ns/dx/prof/role/specification",
      },
    ],
  });
  dsvMetadata["http://www.w3.org/ns/dx/prof/hasResource"].push({
    "@type": ["http://www.w3.org/ns/dx/prof/ResourceDescriptor"],
    "http://www.w3.org/ns/dx/prof/hasArtifact": [
      {
        "@id": options.queryParams ?? ".",
      },
    ],
    "http://www.w3.org/ns/dx/prof/hasRole": [
      {
        "@id": "http://www.w3.org/ns/dx/prof/role/specification",
      },
    ],
  });

  for (const lang of langs) {
    const documentation = context.output.writePath(`${subdirectory}${lang}/index.html`);
    await documentation.write(await getDocumentationData(resource, models, { externalArtifacts, dsv: dsvMetadata, language: lang, prefixMap }, context));
    await documentation.close();
  }
}
