import * as  N3 from "n3";
import {RdfBlankNode, RdfLiteral, RdfNamedNode} from "../rdf-api";

const RDF_LANGSTRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

export type Property = {
  predicate: string,
  object: RdfNamedNode | RdfBlankNode | RdfLiteral
};

export async function parseN3AsProperties<T>(content): Promise<Property[]> {
  return await n3Adapter(content, parseN3QuadAsProperty);
}

async function n3Adapter<T>(
  content, handler: (quad: N3.Quad) => T
): Promise<T[]> {
  const parser = new N3.Parser();
  const quads = [];
  return new Promise((accept, reject) => {
    parser.parse(content, (error, quad, prefixes) => {
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

/**
 * We read just predicate and object values.
 */
function parseN3QuadAsProperty(quad: N3.Quad): Property {
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

type Quad = {
  subject: {
    termType: string,
    value: string,
  },
  predicate: {
    termType: string,
    value: string,
  },
  object: {
    termType: string,
    value: string,
    datatype?: {
      termType: string,
      value: string
    },
    language?: string,
  },
  graph: {
    termType: string,
    value: string,
  },
};

export async function parseN3AsQuads<T>(content): Promise<Quad[]> {
  return await n3Adapter(content, parseN3QuadAsQuad);
}

function parseN3QuadAsQuad(quad: N3.Quad): Quad {
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
  return result as Quad;
}
