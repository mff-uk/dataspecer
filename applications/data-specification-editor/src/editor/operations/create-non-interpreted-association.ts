import { DataPsmCreateAssociationEnd, DataPsmCreateClass } from "@dataspecer/core/data-psm/operation";
import { ComplexOperation } from "@dataspecer/federated-observable-store/complex-operation";
import { FederatedObservableStore } from "@dataspecer/federated-observable-store/federated-observable-store";

/**
 * Adds association to the same class. The association will not have any interpretation.
 */
export class CreateNonInterpretedAssociationToClass implements ComplexOperation {
  private readonly ownerClass: string;
  private store!: FederatedObservableStore;

  constructor(ownerClass: string) {
    this.ownerClass = ownerClass;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.ownerClass) as string;

    const cls = new DataPsmCreateClass();
    cls.dataPsmInterpretation = null;
    cls.dataPsmTechnicalLabel = "class";
    const psmClassIri = (await this.store.applyOperation(schema, cls)).created[0];

    const association = new DataPsmCreateAssociationEnd();
    association.dataPsmInterpretation = null;
    association.dataPsmTechnicalLabel = "association";
    association.dataPsmOwner = this.ownerClass;
    association.dataPsmPart = psmClassIri;
    await this.store.applyOperation(schema, association);
  }
}
