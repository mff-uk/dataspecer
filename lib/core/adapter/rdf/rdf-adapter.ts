import {RdfResourceAdapter, RdfSource} from "./rdf-adapter-api";
import {CoreResource, createCoreResource} from "../../core-resource";
import {RdfSourceWrap} from "./rdf-source-wrap";

export class RdfAdapter {

  readonly adapters: RdfResourceAdapter [];

  constructor(adapters: RdfResourceAdapter[]) {
    this.adapters = adapters;
  }

  /**
   * Load given resource and it's subtree. The subtree is collected by
   * following the objects in statements.
   */
  async loadNodeTree(
    source: RdfSource, iri: string,
  ): Promise<{ [iri: string]: CoreResource }> {
    const nodesToLoad = [iri];
    const result = {};
    while (nodesToLoad.length > 0) {
      const next = nodesToLoad.pop();
      const hasBeenLoaded = result[next] === undefined;
      if (hasBeenLoaded) {
        continue;
      }
      const resource = createCoreResource(next);
      result[resource.iri] = resource;
      const resourceSource = RdfSourceWrap.forIri(next, source);
      const newToLoad = await this.loadNode(resourceSource, resource);
      nodesToLoad.push(...newToLoad);
    }
    return result;
  }

  async loadNode(
    source: RdfSourceWrap, resource: CoreResource,
  ): Promise<string[]> {
    const result = [];
    for (const adapter of this.adapters) {
      const newToLoad = await adapter.loadResource(source, resource);
      result.push(...newToLoad);
    }
    return result;
  }

}
