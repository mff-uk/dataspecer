import { RdfMemorySource } from "../rdf-memory-source.ts";
import { fetchRdfQuads } from "./http-adapter.ts";
import { HttpFetch } from "../../fetch/fetch-api.ts";

export class RdfHttpSource extends RdfMemorySource {
  async fetch(httpFetch: HttpFetch, url: string, asMimeType?: string): Promise<void> {
    this.quads.push(...RdfMemorySource.prefixBlankNodes(
      await fetchRdfQuads(httpFetch, url, asMimeType),
      url
    ));
  }
}
