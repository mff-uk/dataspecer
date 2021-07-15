import {RdfSource, RdfObject} from "../rdf-api";
import {fetchRdfQuadsBySparqlConstruct} from "./sparql-adapter";
import {HttpFetch} from "../../fetch/fetch-api";

export class RdfSparqlSource implements RdfSource {

  readonly httpFetch: HttpFetch;

  readonly endpoint: string;

  constructor(httpFetch: HttpFetch, endpoint: string) {
    this.httpFetch = httpFetch;
    this.endpoint = endpoint;
  }

  async property(iri: string, predicate: string): Promise<RdfObject[]> {
    if (isBlankNode(iri)) {
      return [];
    }
    const query = createSparqlProperty(iri, predicate);
    const quads = await fetchRdfQuadsBySparqlConstruct(
      this.httpFetch, this.endpoint, query);
    return quads.map(quad => quad.object);
  }

  async reverseProperty(
    predicate: string, iri: string
  ): Promise<RdfObject[]> {
    if (isBlankNode(iri)) {
      return [];
    }
    const query = createSparqlReverseProperty(iri, predicate);
    const quads = await fetchRdfQuadsBySparqlConstruct(
      this.httpFetch, this.endpoint, query);
    return quads.map(quad => RdfObject.node(quad.subject));
  }

}

function isBlankNode(iri: string): boolean {
  return iri.startsWith("_");
}

function createSparqlProperty(iri: string, predicate: string): string {
  return `CONSTRUCT { <${iri}> <http://localhost/value> ?o }
  WHERE { <${iri}> <${predicate}> ?o }`;
}

function createSparqlReverseProperty(iri: string, predicate: string): string {
  return `CONSTRUCT { <${iri}> <http://localhost/value> ?s }
  WHERE { ?s <${predicate}> <${iri}> }`;
}
