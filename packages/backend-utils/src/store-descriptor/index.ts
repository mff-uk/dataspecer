/**
 * Describes how to connect to the store and retrieve or modify its data.
 */
export interface StoreDescriptor {
  /**
   * Iri of the store descriptor type
   */
  type: string;
}

export * from "./http-store-descriptor";
