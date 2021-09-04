import {createCoreResource} from "model-driven-data/core";
import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {asDataPsmUpdateAttributeDatatype} from "model-driven-data/data-psm/operation";

export interface CompositeUpdateDataPsmAttributeDatatype {
  forDataPsmAttributeIri: string;
  datatype: string;
}

export async function executeCompositeUpdateDataPsmAttributeDatatype(
    context: StoreContainer,
    operation: CompositeUpdateDataPsmAttributeDatatype,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const dataPsmUpdateAttributeDatatype = asDataPsmUpdateAttributeDatatype(createCoreResource());
  dataPsmUpdateAttributeDatatype.dataPsmAttribute = operation.forDataPsmAttributeIri;
  dataPsmUpdateAttributeDatatype.dataPsmDatatype = operation.datatype;
  await executor.applyOperation(context.dataPsm, dataPsmUpdateAttributeDatatype);

  executor.commit();
}
