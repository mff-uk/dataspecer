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

  reverseProperties(
    predicate: string, iri: string
  ): Promise<(RdfBlankNode | RdfNamedNode)[]> {
    const result = [];
    for (const jsonld of Object.values(this.entities)) {
      const values = jsonld[predicate];
      if (values === undefined) {
        continue;
      }
      for (const value of values) {
        if (isObject(value) && value["@id"] === iri) {
          // We need reference to the jsonld object.
          result.push(jsonLdValueToQuad({"@id": jsonld["@id"]}));
          break;
        }
      }
    }
    return Promise.resolve(result);
  }
}

function jsonLdValueToQuad(value) {
  if (value["@language"] !== undefined) {
    return new RdfLiteral(value["@value"], RDF_LANGSTRING, value["@language"]);
  } else if (value["@id"] !== undefined) {
    if (value["@id"].startsWith("_")) {
      return new RdfBlankNode(value["@id"]);
    } else {
      return new RdfNamedNode(value["@id"]);
    }
  } else if (value["@value"] !== undefined) {
    return new RdfLiteral(value["@value"], XSD_STRING, value["@language"]);
  } else {
    throw new Error("Unknown value: " + JSON.stringify(value));
  }
}

function isObject(value: any): value is boolean {
  return typeof value === "object";
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
