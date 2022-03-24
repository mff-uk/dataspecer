import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {DataPsmSetOrder} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "@model-driven-data/federated-observable-store/complex-operation";
import {FederatedObservableStore} from "@model-driven-data/federated-observable-store/federated-observable-store";

export class SetOrder implements ComplexOperation {
  private readonly parentDataPsmClassIri: string;
  private readonly movedDataPsmResourceIri: string;
  private readonly newIndexPosition: number;
  private store!: FederatedObservableStore;

  constructor(parentDataPsmClassIri: string, movedDataPsmResourceIri: string, newIndexPosition: number) {
    this.parentDataPsmClassIri = parentDataPsmClassIri;
    this.movedDataPsmResourceIri = movedDataPsmResourceIri;
    this.newIndexPosition = newIndexPosition;
  }

  setStore(store: FederatedObservableStore) {
    this.store = store;
  }

  async execute(): Promise<void> {
    const schema = this.store.getSchemaForResource(this.parentDataPsmClassIri) as string;

    const parentClass = await this.store.readResource(this.parentDataPsmClassIri) as DataPsmClass;
    const previousIndex = parentClass.dataPsmParts.indexOf(this.movedDataPsmResourceIri);

    const dataPsmSetOrder = new DataPsmSetOrder();
    dataPsmSetOrder.dataPsmOwnerClass = this.parentDataPsmClassIri;
    dataPsmSetOrder.dataPsmResourceToMove = this.movedDataPsmResourceIri;
    dataPsmSetOrder.dataPsmMoveAfter = this.newIndexPosition === 0 ?
        null :
        parentClass.dataPsmParts[this.newIndexPosition - ((this.newIndexPosition) > previousIndex ? 0 : 1)];
    await this.store.applyOperation(schema, dataPsmSetOrder);
  }
}
