import {StoreDescriptor} from "./index.ts";

/**
 * Describes a store, that can be accessed and modified via HTTP protocol.
 */
export class HttpStoreDescriptor implements StoreDescriptor {
  static readonly TYPE = "https://ofn.gov.cz/store-descriptor/http";

  type: typeof HttpStoreDescriptor.TYPE;

  url: string|null;

  isReadOnly: boolean;

  constructor() {
    this.type = HttpStoreDescriptor.TYPE;
    this.isReadOnly = true;
    this.url = null;
  }

  static is(storeDescriptor: StoreDescriptor): storeDescriptor is HttpStoreDescriptor {
    return storeDescriptor.type === HttpStoreDescriptor.TYPE;
  }
}
