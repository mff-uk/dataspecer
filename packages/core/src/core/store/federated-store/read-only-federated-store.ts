import { CoreResourceReader } from "../../core-reader";
import { CoreResource } from "../../core-resource";

export class ReadOnlyFederatedStore implements CoreResourceReader {
  readonly readers: CoreResourceReader[];

  protected constructor(readers: CoreResourceReader[]) {
    this.readers = readers;
  }

  /**
   * The lazy version returns the first representation of a resource
   * found in {@link readResource}.
   */
  static createLazy(readers: CoreResourceReader[]): ReadOnlyFederatedStore {
    return new ReadOnlyFederatedStore(readers);
  }

  async listResources(): Promise<string[]> {
    const resources = new Set<string>();
    for (const model of this.readers) {
      (await model.listResources()).forEach((resource) =>
        resources.add(resource)
      );
    }
    return [...resources];
  }

  /**
   * Returns the resource from the first reader that has it.
   */
  async readResource(iri: string): Promise<CoreResource> {
    for (const model of this.readers) {
      const resource = await model.readResource(iri);
      if (resource) {
        return resource;
      }
    }
  }

  async listResourcesOfType(typeIri: string): Promise<string[]> {
    const resources = new Set<string>();
    for (const model of this.readers) {
      (await model.listResourcesOfType(typeIri)).forEach((resource) =>
        resources.add(resource)
      );
    }
    return [...resources];
  }
}
