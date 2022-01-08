import {DataPsmClass} from "@model-driven-data/core/data-psm/model";
import {DataPsmSetOrder} from "@model-driven-data/core/data-psm/operation";
import {ComplexOperation} from "../store/complex-operation";
import {OperationExecutor, StoreHavingResourceDescriptor} from "../store/operation-executor";

export class SetOrder implements ComplexOperation {
  private readonly parentDataPsmClassIri: string;
  private readonly movedDataPsmResourceIri: string;
  private readonly newIndexPosition: number;

  constructor(parentDataPsmClassIri: string, movedDataPsmResourceIri: string, newIndexPosition: number) {
    this.parentDataPsmClassIri = parentDataPsmClassIri;
    this.movedDataPsmResourceIri = movedDataPsmResourceIri;
    this.newIndexPosition = newIndexPosition;
  }

  async execute(executor: OperationExecutor): Promise<void> {
    const parentClass = await executor.store.readResource(this.parentDataPsmClassIri) as DataPsmClass;
    const previousIndex = parentClass.dataPsmParts.indexOf(this.movedDataPsmResourceIri);

    const dataPsmSetOrder = new DataPsmSetOrder();
    dataPsmSetOrder.dataPsmOwnerClass = this.parentDataPsmClassIri;
    dataPsmSetOrder.dataPsmResourceToMove = this.movedDataPsmResourceIri;
    dataPsmSetOrder.dataPsmMoveAfter = this.newIndexPosition === 0 ?
        null :
        parentClass.dataPsmParts[this.newIndexPosition - ((this.newIndexPosition) > previousIndex ? 0 : 1)];
    await executor.applyOperation(dataPsmSetOrder, new StoreHavingResourceDescriptor(this.parentDataPsmClassIri));
  }
}
