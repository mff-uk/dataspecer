import {HttpFetch} from "../../fetch/fetch-api";
import {RdfMemorySource} from "../rdf-source-base";
import {fetchRdfQuads} from "../http/http-adapter";

export class SparqlQueryRdfSource extends RdfMemorySource {

  async query(httpFetch: HttpFetch, endpoint: string, query: string): Promise<void> {
    const url = endpoint + "?format=" + encodeURIComponent("text/turtle") + "&query=" + encodeURIComponent(query);
    this.quads = await fetchRdfQuads(httpFetch, url);
  }

}
