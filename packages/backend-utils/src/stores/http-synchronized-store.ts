import {createExecutorMap, CreateNewIdentifier, ExecutorMap, MemoryStore} from "@dataspecer/core/core";
import {HttpSynchronizedStoreConnector} from "../connectors/http-synchronized-store-connector";
import {StoreDescriptor} from "../store-descriptor";
import {HttpStoreDescriptor} from "../store-descriptor/http-store-descriptor";
import {dataPsmExecutors} from "@dataspecer/core/data-psm/data-psm-executors";
import {pimExecutors} from "@dataspecer/core/pim/executor";
import {HttpFetch} from "@dataspecer/core/io/fetch/fetch-api";

/**
 * Naive implementation of {@link MemoryStore} that can synchronize data with
 * the server using simple HTTP api.
 */
export class HttpSynchronizedStore extends MemoryStore {
  protected connector: HttpSynchronizedStoreConnector;

  constructor(baseIri: string, executors: ExecutorMap, createNewIdentifier: CreateNewIdentifier | null, url: string, httpFetch: HttpFetch) {
    super(baseIri, executors, createNewIdentifier);
    this.connector = new HttpSynchronizedStoreConnector(url, httpFetch);
  }

  async save() {
    const operations = this.operations;
    const resources = this.resources;

    await this.connector.save({operations, resources});
  }

  async load() {
    const {operations, resources} = await this.connector.load();

    this.operations = operations;
    this.resources = resources;
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
   */
  static createFromDescriptor(descriptor: StoreDescriptor, httpFetch: HttpFetch):
    HttpSynchronizedStore {
    if (!HttpSynchronizedStore.supportsDescriptor(descriptor)) {
      throw new Error("The given descriptor is not supported.");
    }
    const {url} = descriptor as HttpStoreDescriptor;
    const baseIri = "https://ofn.gov.cz"; // This information should come from
    // the descriptor.
    const createNewIdentifier = null; // This information should come from the
    // descriptor.
    return new HttpSynchronizedStore(
      baseIri,
      createExecutorMap([...dataPsmExecutors, ...pimExecutors]),
      createNewIdentifier,
      url,
      httpFetch,
    );
  }
}
