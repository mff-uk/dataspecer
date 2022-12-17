import { RdfMemorySource } from "../rdf-memory-source";
import { fetchRdfQuads } from "./http-adapter";
import { HttpFetch } from "../../fetch/fetch-api";

export class RdfHttpSource extends RdfMemorySource {
  async fetch(httpFetch: HttpFetch, url: string, asMimeType?: string): Promise<void> {
    this.quads.push(...RdfMemorySource.prefixBlankNodes(
      await fetchRdfQuads(httpFetch, url, asMimeType),
      url
    ));
  }
}
