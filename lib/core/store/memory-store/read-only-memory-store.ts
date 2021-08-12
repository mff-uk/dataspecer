import {CoreModelReader, CoreResource} from "../../../core";
import {clone} from "../../../utilities/clone";

export class ReadOnlyMemoryStore implements CoreModelReader {

  private readonly resources: { [iri: string]: CoreResource };

  constructor(resources: { [iri: string]: CoreResource }) {
    this.resources = resources;
  }

  async listResources(): Promise<string[]> {
    return Object.keys(this.resources);
  }

  async readResource(iri: string): Promise<CoreResource> {
    return clone(this.resources[iri]);
  }

}
