import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {DataPsmAssociationEnd, DataPsmClass} from "model-driven-data/data-psm/model";
import {asDataPsmDeleteAssociationEnd, asDataPsmDeleteClass} from "model-driven-data/data-psm/operation";
import {createCoreResource} from "model-driven-data/core";

export interface CompositeDeleteAssociationClass {
  association: DataPsmAssociationEnd,
  child: DataPsmClass,
  ownerClassIri: string,
}

export async function executeCompositeDeleteAssociationClass(
    context: StoreContainer,
    operation: CompositeDeleteAssociationClass,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const dataPsmDeleteAssociationEnd = asDataPsmDeleteAssociationEnd(createCoreResource());
  dataPsmDeleteAssociationEnd.dataPsmOwner = operation.ownerClassIri;
  dataPsmDeleteAssociationEnd.dataPsmAssociationEnd = operation.association.iri as string;
  await executor.applyOperation(context.dataPsm, dataPsmDeleteAssociationEnd);

  const dataPsmDeleteClass = asDataPsmDeleteClass(createCoreResource());
  dataPsmDeleteClass.dataPsmClass = operation.child.iri as string;
  await executor.applyOperation(context.dataPsm, dataPsmDeleteClass);

  executor.commit();
}
