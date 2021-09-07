import {CoreResource, createCoreResource} from "../../core-resource";
import {RdfSourceWrap} from "./rdf-source-wrap";
import {RdfSource} from "./rdf-api";

/**
 * This class should be used as a container for RdfResourceAdapter. The idea
 * is that the RdfResourceAdapter are capable of loading resources of
 * a particular type. This container aggregate them to load resources
 * of different types.
 */
export class RdfAdapter {

  readonly adapters: RdfResourceLoader [];

  constructor(adapters: RdfResourceLoader[]) {
    this.adapters = adapters;
  }

  /**
   * Load given resource and it's subtree. The subtree is collected by
   * following the objects in statements.
   */
  async rdfToResources(
    source: RdfSource, iri: string,
  ): Promise<{ [iri: string]: CoreResource }> {
    const nodesToLoad = [iri];
    const result = {};
    while (nodesToLoad.length > 0) {
      const next = nodesToLoad.pop();
      if (next === undefined || result[next] !== undefined) {
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

  /**
   * Load only given resource.
   */
  protected async loadNode(
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

/**
 * This interface should be implemented by classes that should be capable
 * of loading object af a particular type.
 */
export interface RdfResourceLoader {

  /**
   * Tries to load data into the given resource. If the resource is not of
   * expected type do nothing and return empty array.
   *
   * @param source Source of the data.
   * @param resource Resource to load data into.
   * @return IRRs of resources to load.
   */
  loadResource(
    source: RdfSourceWrap, resource: CoreResource
  ): Promise<string[]>;

}
