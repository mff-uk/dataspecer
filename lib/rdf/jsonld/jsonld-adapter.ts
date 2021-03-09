//
// Allow loading of RDF files from remote URL and local files.
//

import jsonld from "jsonld";
import {JsonLdEntity} from "./jsonld-types";
import fetch from "./../rdf-fetch";
import {parseN3AsQuads} from "../n3/n3-adapter";
import {Quad} from "n3";

const HAS_FIRST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";

const HAS_REST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";

const RDF_NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";

const HAS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export enum RdfFormat {
  JsonLd = "application/ld+json",
  NQuads = "application/n-quads",
  Turtle = "text/turtle",
  TriG = "application/trig",
  NTriples = "application/n-triples",
}

jsonld.registerRDFParser("text/turtle", parseN3AsQuads);

/**
 * Return flattened-like JSON-LD representation of given resource.
 * Expand @type into predicate and @list into multiple entries.
 */
export async function fetchJsonLd(url: string, format?: RdfFormat,
): Promise<JsonLdEntity[]> {
  const options = {
    "headers": {
      "Accept": format ? format : supportedTypes().join(","),
    },
  };
  const response = await fetch(url, options);
  const mimeType = getContentType(response);
  let result;
  switch (mimeType) {
    case RdfFormat.JsonLd:
      result = await loadJsonLdFromJsonLd(response);
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
    "application/n-quads",
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
  const result = await jsonld.flatten(
    content, undefined, {"documentLoader": urlEncodeDocumentLoader});
  updateJsonLdEntities(result);
  return result;
}

/**
 * We need to encode the URL to handle national characters.
 */
async function urlEncodeDocumentLoader(url) {
  const nodeDocumentLoader = jsonld.documentLoaders.node();
  const encodedUrl = encodeURI(url);
  return nodeDocumentLoader(encodedUrl);
}

/**
 * Normalize shape of JSON-LD, all values are arrays and all references
 * are objects with "@id".
 */
function updateJsonLdEntities(entities: JsonLdEntity[]): void {
  entities.forEach(updateJsonLdEntity);
  unwrapJsonLdList(entities);
}

function updateJsonLdEntity(entity: JsonLdEntity): void {
  if (entity["@type"] !== undefined) {
    entity[HAS_TYPE] = entity["@type"].map((iri) => ({"@id": iri}));
    delete entity["@type"];
  }
  // Every property value must be an array.
  for (const [property, values] of Object.entries(entity)) {
    if (property === "@id") {
      continue;
    }
    if (isArray(values)) {
      continue;
    }
    entity[property] = [values];
  }
}

function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

function unwrapJsonLdList(entities: JsonLdEntity[]): void {
  // New entities are created by expanding the @list keywords.
  const newEntities: JsonLdEntity[] = [];
  for (const entity of entities) {
    for (const [predicate, values] of Object.entries(entity)) {
      if (predicate === "@id") {
        continue;
      }
      entity[predicate] = values.map(value => {
        if (!isObject(value) || value["@list"] === undefined) {
          return value;
        }
        return expandList(newEntities, value["@list"].map(item => item["@id"]));
      });
    }
  }
  // Add new entities.
  entities.push(...newEntities);
}

function isObject(value: unknown): value is boolean {
  return typeof value === "object";
}

function expandList(collector: JsonLdEntity[], iris: string[]) {
  const iriPrefix = "_:b-list-" + collector.length + "-";
  let iriCounter = 0;
  let last = undefined;
  for (const iri of iris) {
    const nextIri = iriPrefix + (iriCounter++);
    const next = {
      "@id": nextIri,
      [HAS_FIRST]: [{"@id": iri}],
    };
    if (last !== undefined) {
      last[HAS_REST] = [{"@id": nextIri}];
    }
    last = next;
    collector.push(next);
  }
  last[HAS_REST] = [{"@id": RDF_NIL}];
  return {"@id": iriPrefix + "0"};
}

async function loadJsonLdFromWithN3(response): Promise<JsonLdEntity[]> {
  const content = await response.text();
  const quads = await parseN3AsQuads(content);
  return quadsToJsonLd(quads);
}

function quadsToJsonLd(quads: Quad[]): JsonLdEntity[] {
  const entities: { [iri: string]: JsonLdEntity } = {};
  for (const {subject, predicate, object} of quads) {
    let entity = entities[subject.value];
    if (entity === undefined) {
      entity = {
        "@id": subject.value,
      };
      entities[subject.value] = entity;
    }
    let values = entity[predicate.value];
    if (values === undefined) {
      values = [];
      entity[predicate.value] = values;
    }
    switch (object.termType) {
      case "BlankNode":
        values.push({"@id": object.value});
        break;
      case "NamedNode":
        values.push({"@id": object.value});
        break;
      case "Literal":
        values.push(objectAsLiteral(object));
        break;
      default:
        throw Error("Unknown object type: " + object.termType);
    }
  }
  return Object.values(entities);
}

function objectAsLiteral(object): Record<string, unknown> {
  const value = {
    "@value": object.value,
  };
  if (object.language !== undefined) {
    value["@language"] = object.language;
  } else {
    value["@type"] = object.datatype.value;
  }
  return value;
}
