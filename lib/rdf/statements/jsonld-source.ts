import {
  RdfEntity,
  RdfBaseValue,
  RdfBlankNode,
  RdfNamedNode,
  RdfLiteral,
} from "../rdf-api";
import {StatementSource} from "./statements-api";
import {JsonLdEntity} from "../jsonld/jsonld-types";
import {fetchJsonLd} from "../jsonld/jsonld-adapter";

const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const XSD_STRING = "https://www.w3.org/2001/XMLSchema#string";

const HAS_FIRST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";

const HAS_REST = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";

const RDF_NIL = "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil";

const HAS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";


/**
 * Internally store RDF as JSON-LD with expanded keywords: @type, @list.
 */
export class JsonldSource implements StatementSource {

  readonly entities: Record<string, JsonLdEntity>;

  protected constructor(entities: Record<string, JsonLdEntity>) {
    this.entities = entities;
  }

  static async create(url: string): Promise<JsonldSource> {
    const content = await fetchJsonLd(url);
    return JsonldSource.wrapEntities(content, url);
  }

  static wrapEntities(content: JsonLdEntity[], url: string) {
    updateJsonLdEntities(content);
    sanitizeBlankNodes(content, url);
    const entities = content.reduce((collector, entity) => {
      collector[entity["@id"]] = entity;
      return collector;
    }, {});
    return new JsonldSource(entities);
  }

  fetch(entity: RdfEntity): Promise<void> {
    const jsonld = this.findEntity(entity.id);
    if (jsonld === undefined) {
      return Promise.resolve();
    }
    for (const [predicate, values] of Object.entries(jsonld)) {
      if (predicate === "@id") {
        continue;
      }
      entity.properties[predicate] = values.map(jsonLdValueToQuad);
    }
    return Promise.resolve();
  }

  private findEntity(id: string): JsonLdEntity | undefined {
    return this.entities[id];
  }

  properties(entity: RdfEntity, predicate: string): Promise<RdfBaseValue[]> {
    const jsonld = this.findEntity(entity.id);
    if (jsonld === undefined || jsonld[predicate] === undefined) {
      return Promise.resolve([]);
    }
    const result = jsonld[predicate].map(jsonLdValueToQuad);
    return Promise.resolve(result);
  }

}

function jsonLdValueToQuad(value) {
  if (value["@language"]) {
    return new RdfLiteral(value["@value"], RDF_LANGSTRING, value["@language"]);
  } else if (value["@id"]) {
    if (value["@id"].startsWith("_")) {
      return new RdfBlankNode(value["@id"]);
    } else {
      return new RdfNamedNode(value["@id"]);
    }
  } else if (value["@value"]) {
    return new RdfLiteral(value["@value"], XSD_STRING, value["@language"]);
  } else {
    throw new Error("Unknown value: " + JSON.stringify(value));
  }
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

function isArray(value: any): boolean {
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

function isObject(value: any): value is boolean {
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
  return {"@id": iriPrefix + "0"}
}


/**
 * Perform in-place update of blank nodes. As documents must not share
 * blank nodes identifiers.
 */
export function sanitizeBlankNodes(
  entities: JsonLdEntity[], baseUrl: string
): void {
  const sanitizeUrl = (url: string) =>
    url.startsWith("_:") ? url + ":" + baseUrl : url;
  for (const entity of Object.values(entities)) {
    entity["@id"] = sanitizeUrl(entity["@id"]);
    for (const [predicate, values] of Object.entries(entity)) {
      if (predicate === "@id") {
        continue;
      }
      entity[predicate] = values.map((value) => {
        if (isObject(value) && value["@id"] !== undefined) {
          value["@id"] = sanitizeUrl(value["@id"]);
        }
        return value;
      });
    }
  }
}