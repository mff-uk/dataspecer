import {createCoreResource, LanguageString} from "model-driven-data/core";
import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {
  asDataPsmUpdateResourceHumanDescription,
  asDataPsmUpdateResourceHumanLabel
} from "model-driven-data/data-psm/operation";

export interface CompositeUpdateDataPsmLabelAndDescription {
  forDataPsmResourceIri: string;
  label: LanguageString;
  description: LanguageString;
}

export async function executeCompositeUpdateDataPsmLabelAndDescription(
    context: StoreContainer,
    operation: CompositeUpdateDataPsmLabelAndDescription,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const dataPsmUpdateResourceHumanLabel = asDataPsmUpdateResourceHumanLabel(createCoreResource());
  dataPsmUpdateResourceHumanLabel.dataPsmResource = operation.forDataPsmResourceIri;
  dataPsmUpdateResourceHumanLabel.dataPsmHumanLabel = operation.label;
  await executor.applyOperation(context.dataPsm, dataPsmUpdateResourceHumanLabel);

  const dataPsmUpdateResourceHumanDescription = asDataPsmUpdateResourceHumanDescription(createCoreResource());
  dataPsmUpdateResourceHumanDescription.dataPsmResource = operation.forDataPsmResourceIri;
  dataPsmUpdateResourceHumanDescription.dataPsmHumanDescription = operation.description;
  await executor.applyOperation(context.dataPsm, dataPsmUpdateResourceHumanDescription);

  executor.commit();
}
