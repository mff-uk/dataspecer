import {CoreResource} from "./core-resource";

export interface CoreResourceReader {

  /**
   * Return IRIs of all resources.
   */
  listResources(): Promise<string[]>;

  /**
   * Return IRIs of all resources with given RDF type.
   */
  listResourcesOfType(typeIri: string): Promise<string[]>;

  /**
   * Return representation of a particular resources.
   */
  readResource(iri: string): Promise<CoreResource | null>;

}
