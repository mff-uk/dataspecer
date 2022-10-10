import {StoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";
import {LocalStoreDescriptor} from "../models/local-store-descriptor";
import {HttpStoreDescriptor} from "@dataspecer/backend-utils/store-descriptor";

export function convertLocalStoresToHttpStores(storeDescriptors: StoreDescriptor[], storeUrlTemplate: string): StoreDescriptor[] {
  return storeDescriptors.map(storeDescriptor => {
    if (LocalStoreDescriptor.is(storeDescriptor)) {
      const desc = new HttpStoreDescriptor();
      desc.url = storeUrlTemplate.replace("{}", storeDescriptor.uuid);
      desc.isReadOnly = false;
      return desc;
    } else {
      return storeDescriptor;
    }
  });
}
