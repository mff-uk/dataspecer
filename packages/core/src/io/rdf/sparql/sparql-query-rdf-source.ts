import { HttpFetch } from "../../fetch/fetch-api.ts";
import { RdfMemorySource } from "../rdf-memory-source.ts";
import { fetchRdfQuads } from "../http/http-adapter.ts";
import { createSparqlQueryUrl } from "./sparql-adapter.ts";

/**
 * Executes a user-defined SPARQL query on a triplestore and provides the
 * results in form of a constant RdfSource.
 */
export class SparqlQueryRdfSource extends RdfMemorySource {
  readonly httpFetch: HttpFetch;

  readonly endpoint: string;

  readonly sparqlQuery: string;

  readonly format: string;

  constructor(
    httpFetch: HttpFetch,
    endpoint: string,
    sparqlQuery: string,
    format = "text/turtle"
  ) {
    super();
    this.httpFetch = httpFetch;
    this.endpoint = endpoint;
    this.sparqlQuery = sparqlQuery;
    this.format = format;
  }

  async query(): Promise<void> {
    const query = createSparqlQueryUrl(
      this.endpoint,
      this.sparqlQuery,
      this.format
    );
    this.quads = await fetchRdfQuads(this.httpFetch, query);
  }
}
