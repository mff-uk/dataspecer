import {PimSetExample} from "@dataspecer/core/pim/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class SetAttributeExample implements ComplexOperation {
  private readonly forPimAttributeIri: string;
  private readonly examples: string[] | null;
  private store!: FederatedObservableStore;

  constructor(forPimAttributeIri: string, examples: string[] | null) {
    this.forPimAttributeIri = forPimAttributeIri;
    this.examples = examples;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.forPimAttributeIri) as string;

    let examples = this.examples;
    if (examples && examples.length === 0) {
      console.warn("SetAttributeExample ComplexOperation: examples should not be an empty array. Setting it to null.");
      examples = null;
    }

    const pimSetExample = new PimSetExample();
    pimSetExample.pimAttribute = this.forPimAttributeIri;
    pimSetExample.pimExample = examples;
    await this.store.applyOperation(schema, pimSetExample);
  }
}
