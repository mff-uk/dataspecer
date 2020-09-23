import * as  N3 from "n3";
import {
  RdfEntity,
  StatementSource,
  RdfBaseValue,
  RdfBlankNode,
  RdfNamedNode,
  RdfLiteral,
} from "./statement-api";
import fetch from "../rdf-fetch";

const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

export class SparqlSource implements StatementSource {

  readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  static async create(url: string): Promise<SparqlSource> {
    return new SparqlSource(url);
  }

  async fetch(entity: RdfEntity): Promise<void> {
    throw Error("TODO");
  }

  async properties(entity: RdfEntity, predicate: string
  ): Promise<RdfBaseValue[]> {
    if (entity.id.startsWith("_")) {
      // There is no point in asking for blank nodes.
      return [];
    }
    const format = "text/plain";
    const url = createSparqlPropertyQueryUrl(
      this.endpoint, format, entity.id, predicate);
    const options = {"headers": {"Accept": format}};
    const response = await fetch(url, options);
    const content = await response.text();
    const properties = await n3Parser(content)
    return Promise.resolve(properties.map(item => item.object));
  }

}

function createSparqlPropertyQueryUrl(
  endpoint: string, format: string, iri: string, predicate: string
): string {
  const query = `CONSTRUCT { <${iri}> <${predicate}> ?o } 
  WHERE { <${iri}> <${predicate}> ?o }`
  return endpoint + "?format=" + encodeURIComponent(format)
    + "&query=" + encodeURIComponent(query);
}

type Property = {
  predicate: string,
  object: RdfNamedNode | RdfBlankNode | RdfLiteral
};

async function n3Parser(content): Promise<Property[]> {
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

function parseN3Quad(quad: N3.Quad): Property {
  let object;
  const objectValue = quad.object.id;
  if (objectValue.startsWith("\"")) {
    const [value, type, language] = parseLiteralId(objectValue);
    object = new RdfLiteral(value, type, language);
  } else if (objectValue.startsWith("_")) {
    object = new RdfBlankNode(objectValue);
  } else {
    object = new RdfNamedNode(objectValue);
  }
  return {
    "predicate": quad.predicate.id,
    "object": object,
  };
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

