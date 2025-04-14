import { RdfMemorySource } from "../rdf-memory-source.ts";
import { parseRdfQuadsWithN3 } from "./n3-adapter.ts";

export class RdfN3Source extends RdfMemorySource {
  /**
   *
   * @param content
   * @param url Used as a prefix for blank nodes.
   */
  async parse(content: string, url: string): Promise<void> {
    this.quads = RdfMemorySource.prefixBlankNodes(
      await parseRdfQuadsWithN3(content),
      url
    );
  }
}
