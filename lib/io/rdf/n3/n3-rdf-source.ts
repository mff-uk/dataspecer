import {RdfMemorySource} from "../rdf-source-base";
import {parseRdfQuadsWithN3} from "./n3-adapter";

export class RdfN3Source extends RdfMemorySource {

  async parse(content: string): Promise<void> {
    this.quads = await parseRdfQuadsWithN3(content);
  }

}
