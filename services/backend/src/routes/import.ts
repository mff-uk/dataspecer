import express from 'express';
import { asyncHandler } from './../utils/async-handler';
import z from 'zod';
import { parse } from 'node-html-parser';
import * as jsonld from 'jsonld';
import { LanguageString } from '@dataspecer/core-v2/semantic-model/concepts';
import N3, { Quad_Object } from 'n3';
import { resourceModel } from '../main';
import { v4 as uuidv4 } from 'uuid';
import { createRdfsModel } from '@dataspecer/core-v2/semantic-model/simplified';
import { httpFetch } from '@dataspecer/core/io/fetch/fetch-nodejs';
import { conceptualModelToEntityListContainer, rdfToConceptualModel } from '@dataspecer/core-v2/semantic-model/data-specification-vocabulary';
import { LOCAL_SEMANTIC_MODEL } from '@dataspecer/core-v2/model/known-models';
import { PimStoreWrapper } from '@dataspecer/core-v2/semantic-model/v1-adapters';

function getIriToIdMapping() {
  const mapping: Record<string, string> = {};
  return (iri: string) => {
    if (!mapping[iri]) {
      mapping[iri] = uuidv4();
    }
    return mapping[iri];
  };
}


function jsonLdLiteralToLanguageString(literal: Quad_Object[]): LanguageString {
  const result: LanguageString = {};
  if (literal) {
    for (const entry of literal) {
      if (entry.termType === "Literal" && entry.language) {
        result[entry.language] = entry.value;
      }
    }
  }
  return result;
}

async function importRdfsModel(parentIri: string, url: string, newIri: string, userMetadata: any) {
  await resourceModel.createResource(
    parentIri,
    newIri,
    "https://dataspecer.com/core/model-descriptor/pim-store-wrapper",
    userMetadata
  );
  const store = await resourceModel.getOrCreateResourceModelStore(newIri);
  const wrapper = await createRdfsModel([url], httpFetch);
  const serialization = await wrapper.serializeModel();
  serialization.id = newIri;
  serialization.alias = userMetadata?.label?.en ?? userMetadata?.label?.cs;
  await store.setJson(serialization);
}

async function importRdfsAndDsv(parentIri: string, rdfsUrl: string | null, dsvUrl: string | null, newIri: string, userMetadata: any) {
  await resourceModel.createResource(
    parentIri,
    newIri,
    LOCAL_SEMANTIC_MODEL,
    userMetadata
  );
  const store = await resourceModel.getOrCreateResourceModelStore(newIri);

  const result = {
    entities: [],
    baseIri: null,
  } as any;

  // Vocabulary
  if (rdfsUrl) {   
    const wrapper = await createRdfsModel([rdfsUrl], httpFetch);
    const serialization = wrapper.serializeModel();
    const model = new PimStoreWrapper(serialization.pimStore, serialization.id, serialization.alias, serialization.urls);
    model.fetchFromPimStore();

    result.entities = {
      ...result.entities,
      ...model.getEntities(),
    }
  }

  // DSV
  if (dsvUrl) {
    const response = await fetch(dsvUrl);
    const data = await response.text();
    const conceptualModel = await rdfToConceptualModel(data);
    const dsvResult = conceptualModelToEntityListContainer(conceptualModel[0], {
      iriToidentifier: getIriToIdMapping(),
    });

    result.entities = {
      ...result.entities,
      ...Object.fromEntries(dsvResult.entities.map(entity => [entity.id, entity])),
    }
  }

  result.modelId = newIri;
  result.modelAlias = (userMetadata?.label?.en ?? userMetadata?.label?.cs);

  await store.setJson(result);
}

/**
 * Imports from URL and creates either a package or PIM model.
 */
async function importFromUrl(parentIri: string, url: string) {
  // const baseIri = url;
  const baseIri = url;

  // Load the URL
  const queryResponse = await fetch(url);
  if (!queryResponse.ok) {
    throw new Error("Failed to fetch the URL: " + queryResponse.statusText);
  }
  if (queryResponse.headers.get("content-type")?.includes("text/html")) {
    const queryText = await queryResponse.text();
    const html = parse(queryText);
    const jsonLdText = html.querySelector('script[type="application/ld+json"]')?.innerHTML ?? "{}";
    const jsonLd = (await jsonld.expand(JSON.parse(jsonLdText), {
      base: baseIri,
    }));
    const nquads = await jsonld.toRDF(jsonLd, {format: 'application/n-quads'});
    const parser = new N3.Parser({ format: 'N-Triples', baseIRI: baseIri });
    const store = new N3.Store();
    store.addQuads(parser.parse(nquads as string));

    const name = jsonLdLiteralToLanguageString(store.getObjects(baseIri, "http://purl.org/dc/terms/title", null));
    const description = jsonLdLiteralToLanguageString(store.getObjects(baseIri, "http://www.w3.org/2000/01/rdf-schema#comment", null));

    // Create package
    const newPackageIri = parentIri + "/" + uuidv4();
    const pkg = await resourceModel.createPackage(parentIri, newPackageIri, {
      label: name,
      description,
      importedFromUrl: url,
    });

    let rdfsUrl = null;
    let dsvUrl = null;

    const artefacts = store.getObjects(baseIri, "https://w3id.org/dsv#artefact", null);
    for (const artefact of artefacts) {
      const artefactUrl = store.getObjects(artefact, "http://www.w3.org/ns/dx/prof/hasArtifact", null)[0].id;
      const role = store.getObjects(artefact, "http://www.w3.org/ns/dx/prof/hasRole", null)[0].id;

      if (role === "http://www.w3.org/ns/dx/prof/role/vocabulary") {
        rdfsUrl = artefactUrl;
      } else if (role === "http://www.w3.org/ns/dx/prof/role/schema") {
        dsvUrl = artefactUrl;
      }
    }

    await importRdfsAndDsv(newPackageIri, rdfsUrl, dsvUrl, newPackageIri + "/model", {
      label: {
        en: (name.en ?? name.cs),
      },
      documentBaseUrl: url,
    });

    const vocabularies = store.getObjects(baseIri, "https://w3id.org/dsv#usedVocabularies", null);
    for (const vocabulary of vocabularies) {
      const urlToImport = vocabulary.id;
      await importFromUrl(newPackageIri, urlToImport);
    }

    return await resourceModel.getResource(newPackageIri);
  } else {
    // Generate name
    let chunkToParse = url;
    try {
        chunkToParse = (new URL(url)).pathname;
    } catch (error) {}

    const name = chunkToParse.split("/").pop()?.split(".")[0] ?? null;

    return await importRdfsModel(parentIri, url, parentIri + "/" + uuidv4(), {
      documentBaseUrl: url,
      ... name ? { label: { en: name } } : {},
    });
  }
}

/**
 * Import: Import endpoint is a wizard that allows you to import specific package/model from a remote source.
 */
export const importResource = asyncHandler(async (request: express.Request, response: express.Response) => {
  const querySchema = z.object({
    // Parent package IRI
    parentIri: z.string().min(1),
    // Url from which to import the resource
    url: z.string().url(),
  });

  const query = querySchema.parse(request.query);

  const result = await importFromUrl(query.parentIri, query.url);

  response.send(result);
  return;
});