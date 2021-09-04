import {createCoreResource} from "model-driven-data/core";
import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {asDataPsmUpdateResourceTechnicalLabel} from "model-driven-data/data-psm/operation";

export interface CompositeUpdateResourceTechnicalLabel {
  forDataPsmResourceIri: string;
  label: string;
}

export async function executeCompositeUpdateResourceTechnicalLabel(
    context: StoreContainer,
    operation: CompositeUpdateResourceTechnicalLabel,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const dataPsmUpdateResourceTechnicalLabel = asDataPsmUpdateResourceTechnicalLabel(createCoreResource());
  dataPsmUpdateResourceTechnicalLabel.dataPsmResource = operation.forDataPsmResourceIri;
  dataPsmUpdateResourceTechnicalLabel.dataPsmTechnicalLabel = operation.label;
  await executor.applyOperation(context.dataPsm, dataPsmUpdateResourceTechnicalLabel);

  executor.commit();
}
