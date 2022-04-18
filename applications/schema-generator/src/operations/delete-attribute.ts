import {DataPsmAttribute, DataPsmClass} from "@dataspecer/core/data-psm/model";
import {DataPsmDeleteAttribute} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class DeleteAttribute implements ComplexOperation {
  private attribute: DataPsmAttribute;
  private ownerClass: DataPsmClass;
  private store!: FederatedObservableStore;

  constructor(attribute: DataPsmAttribute, ownerClass: DataPsmClass) {
    this.attribute = attribute;
    this.ownerClass = ownerClass;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.attribute.iri as string) as string;

    const dataPsmDeleteAttribute = new DataPsmDeleteAttribute();
    dataPsmDeleteAttribute.dataPsmAttribute = this.attribute.iri as string;
    dataPsmDeleteAttribute.dataPsmOwner = this.ownerClass.iri as string;
    await this.store.applyOperation(schema, dataPsmDeleteAttribute);
  }
}
