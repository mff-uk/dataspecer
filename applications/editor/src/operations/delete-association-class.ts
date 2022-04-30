import {DataPsmAssociationEnd, DataPsmClass} from "@dataspecer/core/data-psm/model";
import {DataPsmDeleteAssociationEnd, DataPsmDeleteClass} from "@dataspecer/core/data-psm/operation";
import {ComplexOperation} from "@dataspecer/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@dataspecer/federated-observable-store/federated-observable-store";

export class DeleteAssociationClass implements ComplexOperation {
  private readonly association: DataPsmAssociationEnd;
  private readonly child: DataPsmClass;
  private readonly ownerClassIri: string;
  private store!: FederatedObservableStore;

  constructor(association: DataPsmAssociationEnd, child: DataPsmClass, ownerClassIri: string) {
    this.association = association;
    this.child = child;
    this.ownerClassIri = ownerClassIri;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.ownerClassIri) as string;

    const dataPsmDeleteAssociationEnd = new DataPsmDeleteAssociationEnd();
    dataPsmDeleteAssociationEnd.dataPsmOwner = this.ownerClassIri;
    dataPsmDeleteAssociationEnd.dataPsmAssociationEnd = this.association.iri as string;
    await this.store.applyOperation(schema, dataPsmDeleteAssociationEnd);

    const dataPsmDeleteClass = new DataPsmDeleteClass();
    dataPsmDeleteClass.dataPsmClass = this.child.iri as string;
    await this.store.applyOperation(schema, dataPsmDeleteClass);
  }
}
