import {CoreModelReader, CoreResource} from "../../../core";
import clone from "just-clone";

export class PimReadOnlyMemoryStore implements CoreModelReader {
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
