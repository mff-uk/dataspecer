import {HttpSynchronizedStore} from "./http-synchronized-store";
import {CoreOperation, CoreOperationResult, createExecutorMap} from "@model-driven-data/core/core";
import {StoreDescriptor} from "../store-descriptor";
import {HttpStoreDescriptor} from "../store-descriptor/http-store-descriptor";
import {dataPsmExecutors} from "@model-driven-data/core/data-psm/executor";
import {pimExecutors} from "@model-driven-data/core/pim/executor";

/**
 * This variant of the store synchronizes itself automatically before and after
 * every operation.
 */
export class EagerHttpSynchronizedStore extends HttpSynchronizedStore {
  async applyOperation(operation: CoreOperation): Promise<CoreOperationResult> {
    await this.load();
    const result = await super.applyOperation(operation);
    await this.save();
    return result;
  }

  /**
   * Checks if the given store descriptor can be used to construct this store.
   * @param descriptor
   */
  static supportsDescriptor(descriptor: StoreDescriptor): boolean {
    return HttpStoreDescriptor.is(descriptor);
  }

  /**
   * Creates a function which creates a new store instance from the given store
   * descriptor.
   * @param descriptor
   */
  static createFromDescriptor(descriptor: StoreDescriptor):
    EagerHttpSynchronizedStore {
    if (!EagerHttpSynchronizedStore.supportsDescriptor(descriptor)) {
      throw new Error("The given descriptor is not supported.");
    }
    const {url} = descriptor as HttpStoreDescriptor;
    const baseIri = "https://ofn.gov.cz"; // This information should come from
    // the descriptor.
    const createNewIdentifier = null; // This information should come from the
    // descriptor.
    return new EagerHttpSynchronizedStore(
      baseIri,
      createExecutorMap([...dataPsmExecutors, ...pimExecutors]),
      createNewIdentifier,
      url
    );
  }
}
