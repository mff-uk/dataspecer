import { CoreResource } from "../../core-resource";
import { RdfSourceWrap } from "./rdf-source-wrap";
import { RdfSource } from "./rdf-api";

/**
 * This class should be used as a container for RdfResourceAdapter. The idea
 * is that the RdfResourceAdapter are capable of loading resources of
 * a particular type. This container aggregate them to load resources
 * of different types.
 */
export class RdfAdapter {
  /**
   * The order determine priorities.
   */
  readonly adapters: RdfResourceLoader[];

  constructor(adapters: RdfResourceLoader[]) {
    this.adapters = adapters;
  }

  /**
   * Load given resource and it's subtree. The subtree is collected by
   * following the objects in statements.
   */
  async rdfToResources(
    source: RdfSource,
    iri: string
  ): Promise<{ [iri: string]: CoreResource }> {
    const nodesToLoad: (string | null | undefined)[] = [iri];
    const nodesToNotLoad: Set<string> = new Set();
    const result = {};
    while (nodesToLoad.length > 0) {
      const next = nodesToLoad.pop();
      if (next === null || next === undefined) {
        continue;
      }
      if (nodesToNotLoad.has(next)) {
        continue;
      }
      nodesToNotLoad.add(next);
      const resourceSource = RdfSourceWrap.forIri(next, source);
      const loaded = await this.loadNode(resourceSource);
      result[next] = loaded.resource;
      nodesToLoad.push(...loaded.references);
    }
    return result;
  }

  /**
   * Load only given resource. We are optimistic and assume that only
   * one loader can load the resource.
   */
  protected async loadNode(
    source: RdfSourceWrap
  ): Promise<RdfResourceLoaderResult | null> {
    for (const adapter of this.adapters) {
      const shouldLoad = await adapter.shouldLoadResource(source);
      if (!shouldLoad) {
        continue;
      }
      return await adapter.loadResource(source);
    }
    return Promise.resolve<null>(null);
  }
}

/**
 * This interface should be implemented by classes that should be capable
 * of loading object af a particular type.
 */
export interface RdfResourceLoader {
  /**
   * Return true if given resource should be loaded using this loader.
   */
  shouldLoadResource(source: RdfSourceWrap): Promise<boolean>;

  /**
   * Tries to load data into the given resource. If the resource is not of
   * expected type do nothing and return empty array.
   *
   * @param source Source of the data.
   * @return IRRs of resources to load.
   */
  loadResource(source: RdfSourceWrap): Promise<RdfResourceLoaderResult>;
}

export interface RdfResourceLoaderResult {
  resource: CoreResource | null;

  references: (string | null | undefined)[];
}
