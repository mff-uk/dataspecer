import * as N3 from "n3";
import { RdfObject, RdfQuad, RdfTermType } from "../rdf-api.ts";
import {
  BlankNode,
  DefaultGraph,
  Literal,
  NamedNode,
  Term,
} from "rdflib/lib/tf-types";
import {
  DefaultGraphTermType,
  BlankNodeTermType,
  LiteralTermType,
  NamedNodeTermType,
} from "rdflib/lib/types";

export async function parseRdfQuadsWithN3(content: string): Promise<RdfQuad[]> {
  return await n3Adapter(content, parseN3QuadAsRdfQuad);
}

async function n3Adapter<T>(
  content: string,
  handler: (quad: N3.Quad) => T
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
  return {
    subject: parseTerm(quad.subject),
    predicate: parseTerm(quad.predicate),
    object: parseTerm(quad.object),
    graph: parseTerm(quad.graph),
  };
}

function parseTerm(term: Term): RdfObject {
  if (isNamedNode(term)) {
    return {
      termType: RdfTermType.NamedNode,
      value: term.value,
    } as RdfObject;
  }

  if (isBlankNode(term)) {
    return {
      termType: RdfTermType.BlankNode,
      value: term.value,
    } as RdfObject;
  }

  if (isLiteral(term)) {
    return {
      termType: RdfTermType.Literal,
      value: term.value,
      datatype: {
        termType: RdfTermType.NamedNode,
        value: term.datatype.value,
      },
      language: term.language,
    } as RdfObject;
  }

  if (isDefaultGraph(term)) {
    return {
      termType: RdfTermType.DefaultGraph,
      value: "",
    } as RdfObject;
  }

  throw new Error(`Unknown term type: ${term.termType}`);
}

const isNamedNode = (term: Term): term is NamedNode =>
  term.termType === NamedNodeTermType;
const isBlankNode = (term: Term): term is BlankNode =>
  term.termType === BlankNodeTermType;
const isLiteral = (term: Term): term is Literal =>
  term.termType === LiteralTermType;
const isDefaultGraph = (term: Term): term is DefaultGraph =>
  term.termType === DefaultGraphTermType;
