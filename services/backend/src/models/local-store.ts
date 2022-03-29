import {CoreOperation, CoreOperationResult, CoreResource, CoreResourceReader, CoreResourceWriter, MemoryStore} from "@model-driven-data/core/core";
import {LocalStoreModel} from "./local-store-model";
import {LocalStoreDescriptor} from "./local-store-descriptor";
import {dataPsmExecutors} from "@model-driven-data/core/data-psm/executor";
import {pimExecutors} from "@model-driven-data/core/pim/executor";

export class LocalStore implements CoreResourceReader, CoreResourceWriter {
  protected storeDescriptor: LocalStoreDescriptor;
  protected localStoreModel: LocalStoreModel;
  protected memoryStore: Omit<MemoryStore, "operations" | "resources"> & {
    operations: CoreOperation[];
    resources: { [iri: string]: CoreResource };
  };

  public constructor(storeDescriptor: LocalStoreDescriptor, localStoreModel: LocalStoreModel) {
    this.storeDescriptor = storeDescriptor;
    this.localStoreModel = localStoreModel;
    // @ts-ignore
    this.memoryStore = MemoryStore.create("https://ofn.gov.cz", [...dataPsmExecutors, ...pimExecutors], null);
  }

  listResources(): Promise<string[]> {
    return this.memoryStore.listResources();
  }
  listResourcesOfType(typeIri: string): Promise<string[]> {
    return this.memoryStore.listResourcesOfType(typeIri);
  }
  readResource(iri: string): Promise<CoreResource> {
    return this.memoryStore.readResource(iri);
  }
  applyOperation(operation: CoreOperation): Promise<CoreOperationResult> {
    return this.memoryStore.applyOperation(operation);
  }

  readResourceSync(iri: string): CoreResource | null {
    return this.memoryStore.resources[iri] ?? null;
  }

  async saveStore() {
    const operations = this.memoryStore.operations;
    const resources = this.memoryStore.resources;

    const payload = JSON.stringify({operations, resources});
    await this.localStoreModel.set(this.storeDescriptor.uuid, payload);
  }

  async loadStore() {
    const rawData = await this.localStoreModel.get(this.storeDescriptor.uuid);
    if (!rawData) {
      throw new Error("Store does not exists");
    }
    const rawObject = JSON.parse(rawData.toString());

    this.memoryStore.operations = rawObject.operations;
    this.memoryStore.resources = rawObject.resources;
  }
}
