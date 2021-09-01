import {ApplyOperationOnModelContainer, StoreContainer} from "../ModelObserverContainer";
import {createCoreResource} from "model-driven-data/core";
import {asDataPsmUpdateResourceOrder} from "model-driven-data/data-psm/operation";
import {DataPsmClass} from "model-driven-data/data-psm/model";

export interface CompositeUpdateOrder {
  parentDataPsmClassIri: string;
  movedDataPsmResourceIri: string;
  newIndexPosition: number;
}

export async function executeCompositeUpdateOrder(
    context: StoreContainer,
    operation: CompositeUpdateOrder,
): Promise<void> {
  const parentClass = await context.dataPsm.model.readResource(operation.parentDataPsmClassIri) as DataPsmClass;
  const previousIndex = parentClass.dataPsmParts.indexOf(operation.movedDataPsmResourceIri);

  const dataPsmUpdateResourceOrder = asDataPsmUpdateResourceOrder(createCoreResource());
  dataPsmUpdateResourceOrder.dataPsmOwnerClass = operation.parentDataPsmClassIri;
  dataPsmUpdateResourceOrder.dataPsmResourceToMove = operation.movedDataPsmResourceIri;
  dataPsmUpdateResourceOrder.dataPsmMoveAfter = operation.newIndexPosition === 0 ?
      null :
      parentClass.dataPsmParts[operation.newIndexPosition - ((operation.newIndexPosition) > previousIndex ? 0 : 1)];
  await ApplyOperationOnModelContainer(context.dataPsm, dataPsmUpdateResourceOrder);
}
