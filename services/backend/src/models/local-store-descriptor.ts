import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {LocalStoreModel} from "./local-store-model.ts";
import {LocalStore} from "./local-store.ts";

/**
 * Describes store, that is managed by {@link LocalStoreModel}.
 */
export class LocalStoreDescriptor implements StoreDescriptor {
  static readonly TYPE = "https://ofn.gov.cz/store-descriptor/backend-local";

  type: typeof LocalStoreDescriptor.TYPE = LocalStoreDescriptor.TYPE;

  uuid: string;

  constructor(uuid: string) {
    this.uuid = uuid;
  }

  static is(storeDescriptor: StoreDescriptor): storeDescriptor is LocalStoreDescriptor {
    return storeDescriptor.type === LocalStoreDescriptor.TYPE;
  }

  static async construct(storeDescriptor: LocalStoreDescriptor, localStoreModel: LocalStoreModel): Promise<LocalStore> {
    return new LocalStore(storeDescriptor, localStoreModel);
  }
}
