import { DataSpecificationWithMetadata, DataSpecificationWithStores } from "@dataspecer/backend-utils/interfaces";
import { StoreDescriptor } from "@dataspecer/backend-utils/store-descriptor";
import { CoreResourceReader } from "@dataspecer/core/core/core-reader";
import { ReadOnlyFederatedStore } from "@dataspecer/core/core/index";
import { DataSpecification } from "@dataspecer/core/data-specification/model/data-specification";
import { InputStream } from "@dataspecer/core/io/stream/input-stream";
import { StreamDictionary } from "@dataspecer/core/io/stream/stream-dictionary";
import express from "express";
import { z } from "zod";
import configuration from "../configuration.ts";
import { DefaultArtifactBuilder } from "../generate/default-artifact-builder.ts";
import { ZipStreamDictionary } from "../generate/zip-stream-dictionary.ts";
import { dataSpecificationModel, resourceModel, storeModel } from "../main.ts";
import { LocalStore } from "../models/local-store.ts";
import { LocalStoreDescriptor } from "../models/local-store-descriptor.ts";
import { asyncHandler } from "../utils/async-handler.ts";
import { generateSpecification } from "@dataspecer/specification";
import { BackendModelRepository } from "../utils/model-repository.ts";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-nodejs";

type FullDataSpecification = DataSpecification & DataSpecificationWithMetadata & DataSpecificationWithStores;

interface DataSpecifications {
  [key: string]: FullDataSpecification;
}

export const generate = asyncHandler(async (request: express.Request, response: express.Response) => {
  const querySchema = z.object({
    iri: z.string().min(1),
  });
  const query = querySchema.parse(request.query);

  const pckg = await resourceModel.getPackage(query.iri);

  if (!pckg) {
    response.status(404).send({ error: "Package does not exist." });
    return;
  }

  const packagesToGenerate = [query.iri];
  const defaultConfiguration = configuration.configuration;
  const dataSpecifications = Object.fromEntries((await dataSpecificationModel.getAllDataSpecifications()).map((s) => [s.iri, s])) as Record<string, FullDataSpecification>;

  const gatheredDataSpecifications: DataSpecifications = {};
  const toProcessDataSpecification = [...packagesToGenerate];

  for (let i = 0; i < toProcessDataSpecification.length; i++) {
    const dataSpecification = dataSpecifications[toProcessDataSpecification[i]];
    gatheredDataSpecifications[dataSpecification.iri as string] = dataSpecification;
    dataSpecification.importsDataSpecifications.forEach((importedDataSpecificationIri) => {
      if (!toProcessDataSpecification.includes(importedDataSpecificationIri)) {
        toProcessDataSpecification.push(importedDataSpecificationIri);
      }
    });
  }

  // Gather all store descriptors

  const storeDescriptors = Object.values(gatheredDataSpecifications).reduce((acc, dataSpecification) => {
    return [...acc, ...dataSpecification.pimStores, ...Object.values(dataSpecification.psmStores).flat(1)];
  }, [] as StoreDescriptor[]);

  // Create stores or use the cache.

  const constructedStores: CoreResourceReader[] = [];

  for (const storeDescriptor of storeDescriptors) {
    const localStoreDescriptor = storeDescriptor as LocalStoreDescriptor;
    const store = new LocalStore(localStoreDescriptor, storeModel);
    await store.loadStore();
    constructedStores.push(store);
  }

  const federatedStore = ReadOnlyFederatedStore.createLazy(constructedStores);

  const generator = new DefaultArtifactBuilder(federatedStore, gatheredDataSpecifications, defaultConfiguration);
  await generator.prepare(Object.keys(gatheredDataSpecifications));
  const data = await generator.build();

  // Send zip file
  response.type("application/zip").send(data);

  return;
});
class SingleFileStreamDictionary implements StreamDictionary {
  requestedFileContents: string | null = null;
  constructor(private requestedFile: string) {}
  readPath(): InputStream {
    throw new Error("Method not implemented.");
  }
  exists(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  list(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  writePath(path: string) {
    return {
      write: async (data: string) => {
        if (path === this.requestedFile) {
          this.requestedFileContents = data;
        }
      },
      close: () => Promise.resolve(),
    };
  }
}

async function generateArtifacts(packageIri: string, streamDictionary: StreamDictionary, queryParams: string = "") {
  // Call the main function from @dataspecer/specification
  await generateSpecification(packageIri, {
    modelRepository: new BackendModelRepository(resourceModel),
    output: streamDictionary,
    fetch: httpFetch,
  }, {
    queryParams,
  });
}

export const getZip = asyncHandler(async (request: express.Request, response: express.Response) => {
  const querySchema = z.object({
    iri: z.string().min(1),
  });
  const query = querySchema.parse(request.query);

  const resource = await resourceModel.getPackage(query.iri);

  if (!resource) {
    response.status(404).send({ error: "Package does not exist." });
    return;
  }

  const zip = new ZipStreamDictionary();

  await generateArtifacts(query.iri, zip);

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
    raw: z
      .string()
      .optional()
      .transform((value) => value !== undefined)
      .pipe(z.boolean()),
  });
  const query = querySchema.parse(request.query);
  const resource = await resourceModel.getPackage(query.iri);
  if (!resource) {
    response.status(404).send({ error: "Package does not exist." });
    return;
  }

  const streamDictionary = new SingleFileStreamDictionary(path);
  await generateArtifacts(query.iri, streamDictionary, query.raw ? "" : "?iri=" + encodeURIComponent(query.iri));

  if (streamDictionary.requestedFileContents === null) {
    response.status(404).send({ error: "File not found." });
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
