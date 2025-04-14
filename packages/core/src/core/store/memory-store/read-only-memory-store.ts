import { clone } from "../../utilities/clone.ts";
import { CoreResourceReader } from "../../core-reader.ts";
import { CoreResource } from "../../core-resource.ts";

export class ReadOnlyMemoryStore implements CoreResourceReader {
  private readonly resources: { [iri: string]: CoreResource };

  protected constructor(resources: { [iri: string]: CoreResource }) {
    this.resources = resources;
  }

  static create(resources: {
    [iri: string]: CoreResource;
  }): ReadOnlyMemoryStore {
    return new ReadOnlyMemoryStore(resources);
  }

  listResources(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.resources));
  }

  listResourcesOfType(typeIri: string): Promise<string[]> {
    const result: string[] = [];
    for (const [iri, resource] of Object.entries(this.resources)) {
      if (resource.types.includes(typeIri)) {
        result.push(iri);
      }
    }
    return Promise.resolve(result);
  }

  readResource(iri: string): Promise<CoreResource | null> {
    const resource = this.resources[iri];
    if (resource === undefined) {
      return Promise.resolve(null);
    }
    return Promise.resolve(clone(this.resources[iri]) as CoreResource);
  }
}
