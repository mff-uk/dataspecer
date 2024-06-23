import express from 'express';
import { asyncHandler } from './../utils/async-handler';
import z from 'zod';
import { parse } from 'node-html-parser';
import * as jsonld from 'jsonld';
import { LanguageString } from '@dataspecer/core-v2/semantic-model/concepts';
import N3, { Quad_Object } from 'n3';
import { resourceModel } from '../main';
import { v4 as uuidv4 } from 'uuid';
import { createPimModel, createRdfsModel } from '@dataspecer/core-v2/semantic-model/simplified';
import { httpFetch } from '@dataspecer/core/io/fetch/fetch-nodejs';


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

  // const baseIri = query.url;
  const baseIri = query.url;

  // Load the URL
  const queryResponse = await fetch(query.url);
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
  const newPackageIri = query.parentIri + "/" + uuidv4();
  const pkg = await resourceModel.createPackage(query.parentIri, newPackageIri, {
    label: name,
    description,
  });

  const artefacts = store.getObjects(baseIri, "https://w3id.org/dsv#artefact", null);
  for (const artefact of artefacts) {
    const artefactUrl = store.getObjects(artefact, "http://www.w3.org/ns/dx/prof/hasArtifact", null)[0].id;
    const role = store.getObjects(artefact, "http://www.w3.org/ns/dx/prof/hasRole", null)[0].id;

    if (role === "http://www.w3.org/ns/dx/prof/role/vocabulary") {
      // Create PIM model
      await resourceModel.createResource(newPackageIri, newPackageIri + "/vocabulary", "https://dataspecer.com/core/model-descriptor/pim-store-wrapper", {
        label: {
          en: (name.en ?? name.cs),
        }
      });
      const store = await resourceModel.getOrCreateResourceModelStore(newPackageIri + "/vocabulary");
      const wrapper = await createRdfsModel([artefactUrl], httpFetch);
      const serialization = await wrapper.serializeModel();
      serialization.id = newPackageIri + "/vocabulary";
      serialization.alias = (name.en ?? name.cs);

      await store.setJson(serialization);
    }
  }

  const resource = await resourceModel.getResource(newPackageIri);

  response.send(resource);
  return;
});