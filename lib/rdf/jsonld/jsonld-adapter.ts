//
// Allow loading of RDF files from remote URL and local files.
//

import jsonld from "jsonld";
import {JsonLdEntity} from "./jsonld-types";
import fetch from "./../rdf-fetch";
import {parseN3AsQuads} from "../n3/n3-adapter";

export enum RdfFormat {
  JsonLd = "application/ld+json",
  NQuads = "application/n-quads",
  Turtle = "text/turtle",
  TriG = "application/trig",
  NTriples = "application/n-triples",
}

jsonld.registerRDFParser("text/turtle", parseN3AsQuads);

/**
 * Return flattened JSON-LD representation of given resource.
 *
 * @param url
 * @param format Optional, requested mime-type.
 */
export async function fetchJsonLd(url: string, format?: RdfFormat
): Promise<JsonLdEntity[]> {
  const options = {
    "headers": {
      "Accept": format ? format : supportedTypes().join(","),
    }
  };
  const response = await fetch(url, options);
  const mimeType = getContentType(response);
  let result;
  switch (mimeType) {
    case RdfFormat.JsonLd:
      result =  await loadJsonLdFromJsonLd(response);
      break;
    case RdfFormat.NQuads:
    case RdfFormat.Turtle:
    case RdfFormat.TriG:
    case RdfFormat.NTriples:
      result = await loadJsonLdFromWithN3(response);
      break;
    default:
      throw new Error(`Unsupported format '${mimeType}'`);
  }
  return result;
}

function supportedTypes() {
  return [
    "application/ld+json",
    "application/n-quads"
  ];
}

function getContentType(response): string | undefined {
  if (!response.headers.has("content-type")) {
    throw Error("Missing 'content-type' header.");
  }
  const value = response.headers.get("content-type").toLowerCase();
  const index = value.indexOf(";");
  return index === -1 ? value : value.substr(0, index);
}

async function loadJsonLdFromJsonLd(response): Promise<JsonLdEntity[]> {
  const content = await response.json();
  return await jsonld.flatten(
    content, undefined, {"documentLoader": urlEncodeDocumentLoader});
}

/**
 * We need to encode the URL to handle national characters.
 */
async function urlEncodeDocumentLoader(url) {
  const nodeDocumentLoader = jsonld.documentLoaders.node();
  const encodedUrl = encodeURI(url);
  return nodeDocumentLoader(encodedUrl);
}

async function loadJsonLdFromWithN3(response): Promise<JsonLdEntity[]> {
  const content = await response.text();
  const quads = await parseN3AsQuads(content)
  const document = await jsonld.fromRDF(quads);
  return await jsonld.flatten(document);
}
