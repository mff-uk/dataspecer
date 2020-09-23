import {
  RdfEntity,
  StatementSource,
  RdfBaseValue,
  RdfBlankNode,
  RdfNamedNode,
  RdfLiteral,
} from "./statement-api";
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
    return JsonldSource.wrapEntities(content);
  }

  static wrapEntities(content: JsonLdEntity[]) {
    const entities = content.reduce((collector, entity) => {
      updateJsonLdEntity(entity)
      collector[entity["@id"]] = entity;
      return collector;
    }, {});
    unwrapJsonLdList(entities);
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

/**
 * JSONLD employ some keywords, we need to get rid of them.
 */
function updateJsonLdEntity(entity) {
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

function unwrapJsonLdList(entities: Record<string, JsonLdEntity[]>) {
  const newEntities: Record<string, JsonLdEntity[]> = {};
  for (const entity of Object.values(entities)) {
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
  for (const [key, value] of Object.entries(newEntities)) {
    entities[key] = value;
  }
}

function isObject(value: any): value is boolean {
  return typeof value === "object";
}

function expandList(
  collector: Record<string, JsonLdEntity>,
  iris: string[]
) {
  const iriPrefix = "_:b-list-" + Object.keys(collector).length + "-";
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
    collector[nextIri] = next;
  }
  last[HAS_REST] = [{"@id": RDF_NIL}];
  return {"@id": iriPrefix + "0"}
}

function jsonLdValueToQuad(value) {
  if (value["@language"]) {
    return new RdfLiteral(value["@value"], RDF_LANGSTRING, value["@language"]);
  } else if (value["@type"]) {
    return new RdfLiteral(value["@value"], value["@type"], undefined);
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
