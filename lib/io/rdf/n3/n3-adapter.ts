import * as N3 from "n3";
import {RdfQuad, RdfTermType} from "../rdf-api";

const RDF_LANGUAGE_STRING =
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const XSD_STRING =
  "http://www.w3.org/2001/XMLSchema#string";

export async function parseRdfQuadsWithN3(content: string): Promise<RdfQuad[]> {
  return await n3Adapter(content, parseN3QuadAsRdfQuad);
}

async function n3Adapter<T>(
  content: string, handler: (quad: N3.Quad) => T,
): Promise<T[]> {
  const parser = new N3.Parser();
  const quads = [];
  return new Promise<T[]>((accept, reject) => {
    parser.parse(content, (error, quad) => {
      if (error !== null) {
        reject(error);
      } else if (quad === null) {
        accept(quads);
      } else {
        quads.push(handler(quad));
      }
    });
  });
}

function parseN3QuadAsRdfQuad(quad: N3.Quad): RdfQuad {
  const result = {};
  const subject = quad.subject.id;
  result["subject"] = {
    "termType": subject.startsWith("_") ?
      RdfTermType.BlankNode : RdfTermType.NamedNode,
    "value": subject,
  };
  const predicate = quad.predicate.id;
  result["predicate"] = {
    "termType": RdfTermType.NamedNode,
    "value": predicate,
  };
  const object = quad.object.id;
  if (object.startsWith("\"")) {
    const [value, type, language] = parseLiteralId(object);
    result["object"] = {
      "termType": RdfTermType.Literal,
      "value": value,
      "datatype": {
        "termType": RdfTermType.NamedNode,
        "value": type,
      },
      "language": language,
    };
  } else if (object.startsWith("_")) {
    result["object"] = {
      "termType": RdfTermType.BlankNode,
      "value": object,
    };
  } else {
    result["object"] = {
      "termType": RdfTermType.NamedNode,
      "value": object,
    };
  }
  const graph = quad.graph.id;
  if (graph === "") {
    result["graph"] = {
      "termType": RdfTermType.DefaultGraph,
      "value": "",
    };
  } else if (graph.startsWith("_")) {
    result["graph"] = {
      "termType": RdfTermType.BlankNode,
      "value": graph,
    };
  } else {
    result["graph"] = {
      "termType": RdfTermType.NamedNode,
      "value": graph,
    };
  }
  return result as RdfQuad;
}

function parseLiteralId(input: string): string[] {
  const [head, tail] = splitLiteralId(input);
  if (tail === "") {
    return [head, XSD_STRING, undefined];
  } else if (tail.startsWith("@")) {
    return [head, RDF_LANGUAGE_STRING, tail.substr(1)];
  } else if (tail.startsWith("^^")) {
    return [head, tail.substr(2), undefined];
  } else {
    throw new Error(`Can not parse: ${input}`);
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
      break;
    }
    head += char;
  }
  return [head, tail];
}
