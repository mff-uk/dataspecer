import {CoreResource} from "../core-resource";

export interface CoreModelReader {

  /**
   * Return IRIs of all resources in the diagram.
   */
  listResources(): Promise<string[]>;

  /**
   * Return representation of a particular resources.
   */
  readResource(iri: string): Promise<CoreResource>;

}
