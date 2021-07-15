import {RdfMemorySource} from "../rdf-source-base";
import {fetchRdfQuads} from "./http-adapter";
import {HttpFetch} from "../../fetch/fetch-api";

export class RdfHttpSource extends RdfMemorySource {

  async parse(httpFetch: HttpFetch, url: string): Promise<void> {
    this.quads = await fetchRdfQuads(httpFetch, url);
  }

}
