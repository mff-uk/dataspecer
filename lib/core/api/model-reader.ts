import {CoreResource} from "../model";

export interface CoreModelReader {

  /**
   * Return IRIs of all resources in the diagram.
   */
  listResources(): Promise<string[]>;

  /**
   * Return representation of a particular resources.
   */
  readResources(iri: string): Promise<CoreResource>;

}
