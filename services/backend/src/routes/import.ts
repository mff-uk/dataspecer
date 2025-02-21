import { LOCAL_SEMANTIC_MODEL } from '@dataspecer/core-v2/model/known-models';
import { isSemanticModelClass, isSemanticModelRelationship, LanguageString, SemanticModelEntity } from '@dataspecer/core-v2/semantic-model/concepts';
import { conceptualModelToEntityListContainer, rdfToConceptualModel } from '@dataspecer/core-v2/semantic-model/data-specification-vocabulary';
import { createRdfsModel } from '@dataspecer/core-v2/semantic-model/simplified';
import { isSemanticModelRelationshipUsage } from '@dataspecer/core-v2/semantic-model/usage/concepts';
import { PimStoreWrapper } from '@dataspecer/core-v2/semantic-model/v1-adapters';
import { httpFetch } from '@dataspecer/core/io/fetch/fetch-nodejs';
import express from 'express';
import * as jsonld from 'jsonld';
import N3, { Quad_Object } from 'n3';
import { parse } from 'node-html-parser';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';
import { resourceModel } from '../main';
import { asyncHandler } from './../utils/async-handler';
import { DataTypeURIs } from "@dataspecer/core-v2/semantic-model/datatypes";

function getIriToIdMapping(knownMapping: Record<string, string> = {}) {
  const mapping = {...knownMapping};
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

/**
 * Splits IRI into prefix and local name.
 * If invalid, only local name is returned.
 */
function splitIri(iri: string | null | undefined): [string, string] {
  if (!iri) {
    return ["", ""];
  }
  const separator = Math.max(iri.lastIndexOf("#"), iri.lastIndexOf("/"));
  if (separator === -1) {
    return ["", iri];
  }
  return [iri.substring(0, separator + 1), iri.substring(separator + 1)];
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

  /**
   * We import entities identified by their IRIs and store them with their IDs.
   */
  const knownMapping: Record<string, string> = {};
  for (const datatype of DataTypeURIs) {
    knownMapping[datatype] = datatype
  }

  // Vocabulary
  if (rdfsUrl) {
    const wrapper = await createRdfsModel([rdfsUrl], httpFetch);
    const serialization = wrapper.serializeModel();
    const model = new PimStoreWrapper(serialization.pimStore, serialization.id, serialization.alias, serialization.urls);
    model.fetchFromPimStore();

    for (const entity of Object.values(model.getEntities())) {
      if (isSemanticModelClass(entity)) {
        knownMapping[entity.iri!] = entity.id;
      }
      if (isSemanticModelRelationship(entity)) {
        if (entity.iri) {
          knownMapping[entity.iri!] = entity.id;
        }
        for (const end of entity.ends) {
          if (end.iri) {
            knownMapping[end.iri!] = entity.id;
          }
        }
      }
    }

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
      iriToIdentifier: getIriToIdMapping(knownMapping),
    });

    result.entities = {
      ...result.entities,
      ...Object.fromEntries(dsvResult.entities.map(entity => [entity.id, entity])),
    }
  }

  // Manage prefixes
  const prefixesCount: Record<string, number> = {};
  for (const entity of Object.values(result.entities) as SemanticModelEntity[]) {
    const [prefix] = splitIri(entity.iri);
    if (prefix) {
      prefixesCount[prefix] = (prefixesCount[prefix] ?? 0) + 1;
    }

    if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
      for (const end of entity.ends) {
        const [prefix] = splitIri(end.iri);
        if (prefix) {
          prefixesCount[prefix] = (prefixesCount[prefix] ?? 0) + 1;
        }
      }
    }
  }
  let bestPrefix = null;
  let bestPrefixCount = 0;
  for (const [prefix, count] of Object.entries(prefixesCount)) {
    if (count > bestPrefixCount) {
      bestPrefix = prefix;
      bestPrefixCount = count;
    }
  }
  result.baseIri = bestPrefix;
  if (bestPrefix) {
    for (const entity of Object.values(result.entities) as SemanticModelEntity[]) {
      if (entity.iri && entity.iri.startsWith(bestPrefix)) {
        entity.iri = entity.iri.substring(bestPrefix.length);
      }
      if (isSemanticModelRelationship(entity) || isSemanticModelRelationshipUsage(entity)) {
        for (const end of entity.ends) {
          if (end.iri && end.iri.startsWith(bestPrefix)) {
            end.iri = end.iri.substring(bestPrefix.length);
          }
        }
      }
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
  url = url.replace(/#.*$/, "");
  console.log("Importing from URL: " + url);

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
      documentBaseUrl: url,
    });

    let rdfsUrl = null;
    let dsvUrl = null;

    const artefacts = store.getObjects(baseIri, "https://w3id.org/dsv#artefact", null);
    for (const artefact of artefacts) {
      console.log(artefact);
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

    const vocabularies = [...new Set([
      ...store.getObjects(baseIri, "https://w3id.org/dsv#usedVocabularies", null).map(v => v.id),
      ...store.getObjects(baseIri, "https://w3id.org/dsv-dap#dct-references", null).map(v => v.id),
    ])];
    for (const vocabularyId of vocabularies) {
      const urlToImport = vocabularyId;
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