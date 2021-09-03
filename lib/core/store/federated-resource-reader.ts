import {CoreResourceReader} from "../api";
import {CoreResource} from "../core-resource";

/**
 * Resource reader combining multiple {@link CoreResourceReader} into one.
 *
 * Individual readers are expected to have different iris for different resources.
 */
export class FederatedResourceReader implements CoreResourceReader {
  readonly models: CoreResourceReader[];

  constructor(models: CoreResourceReader[]) {
    this.models = models;
  }

  async listResources(): Promise<string[]> {
    const resources = new Set<string>();
    for (const model of this.models) {
      (await model.listResources()).forEach(resources.add);
    }
    return [...resources];
  }

  /**
   * Returns the resource from the first reader that has it.
   */
  async readResource(iri: string): Promise<CoreResource> {
    for (const model of this.models) {
      const resource = await model.readResource(iri);
      if (resource) {
        return resource;
      }
    }
  }

  async listResourcesOfType(typeIri: string): Promise<string[]> {
    const resources = new Set<string>();
    for (const model of this.models) {
      (await model.listResourcesOfType(typeIri)).forEach(resources.add);
    }
    return [...resources];
  }
}
