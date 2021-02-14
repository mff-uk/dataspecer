//
// Allow loading of RDF files from remote URL and local files.
//

import jsonld from "jsonld";
import * as  N3 from "n3";
import {JsonLdEntity} from "./jsonld-types";
import fetch from "../rdf-fetch";

const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

export enum RdfFormat {
  JsonLd = "application/ld+json",
  NQuads = "application/n-quads",
  Turtle = "text/turtle",
  TriG = "application/trig",
  NTriples = "application/n-triples",
}

jsonld.registerRDFParser("text/turtle", n3Parser);

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
  switch (mimeType) {
    case RdfFormat.JsonLd:
      return await loadRdfFromJsonLd(response);
    case RdfFormat.NQuads:
    case RdfFormat.Turtle:
    case RdfFormat.TriG:
    case RdfFormat.NTriples:
      return await loadRdfFromWithN3(response);
    default:
      throw new Error(`Unsupported format '${mimeType}'`);
  }
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

async function loadRdfFromJsonLd(response): Promise<JsonLdEntity[]> {
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

async function loadRdfFromWithN3(response): Promise<JsonLdEntity[]> {
  const content = await response.text();
  const quads = await n3Parser(content)
  const document = await jsonld.fromRDF(quads);
  return await jsonld.flatten(document);
}

async function n3Parser(content) {
  const parser = new N3.Parser();
  const quads = [];
  return new Promise((accept, reject) => {
    parser.parse(content, (error, quad, prefixes) => {
      if (error !== null) {
        reject(error);
      } else if (quad === null) {
        accept(quads);
      } else {
        quads.push(parseN3Quad(quad));
      }
    });
  });
}

function parseN3Quad(quad: N3.Quad) {
  const result = {};
  const subject = quad.subject.id;
  result["subject"] = {
    "termType": subject.startsWith("_") ? "BlankNode" : "NamedNode",
    "value": subject,
  };
  const predicate = quad.predicate.id;
  result["predicate"] = {"termType": "NamedNode", "value": predicate};
  const object = quad.object.id;
  if (object.startsWith("\"")) {
    const [value, type, language] = parseLiteralId(object);
    result["object"] = {
      "termType": "Literal",
      "value": value,
      "datatype": {
        "termType": "NamedNode",
        "value": type,
      },
      "language": language,
    };
  } else if (object.startsWith("_")) {
    result["object"] = {"termType": "BlankNode", "value": object};
  } else {
    result["object"] = {"termType": "NamedNode", "value": object};
  }
  const graph = quad.graph.id;
  if (graph === "") {
    result["graph"] = {
      "termType": "DefaultGraph",
      "value": "",
    }
  } else if (graph.startsWith("_")) {
    result["graph"] = {
      "termType": "BlankNode",
      "value": graph,
    }
  } else {
    result["graph"] = {
      "termType": "NamedNode",
      "value": graph,
    }
  }
  return result;
}

function parseLiteralId(input: string): string[] {
  const [head, tail] = splitLiteralId(input);
  if (tail === "") {
    return [head, XSD_STRING, undefined];
  } else if (tail.startsWith("@")) {
    return [head, RDF_LANGSTRING, tail.substr(1)];
  } else if (tail.startsWith("^^")) {
    return [head, tail.substr(2), undefined];
  } else {
    throw new Error(`Can not parse: ${input}`)
  }
}

function splitLiteralId(input: string): string[] {
  let head = "";
  let tail = "";
  let escaped = false;
  for (let index = 1; index < input.length; ++index) {
    const char = input[index];
    if (escaped) {
      escaped = false;
      head += char;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "\"") {
      tail = input.substr(index + 1);
      break
    }
    head += char;
  }
  return [head, tail];
}
