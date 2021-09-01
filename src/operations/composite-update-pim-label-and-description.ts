import {createCoreResource, LanguageString} from "model-driven-data/core";
import {MultipleOperationExecutor, StoreContainer} from "../ModelObserverContainer";
import {asPimUpdateResourceHumanDescription, asPimUpdateResourceHumanLabel} from "model-driven-data/pim/operation";

export interface CompositeUpdatePimLabelAndDescription {
  forPimResourceIri: string;
  label: LanguageString;
  description: LanguageString;
}

export async function executeCompositeUpdatePimLabelAndDescription(
    context: StoreContainer,
    operation: CompositeUpdatePimLabelAndDescription,
): Promise<void> {
  const executor = new MultipleOperationExecutor();

  const pimUpdateResourceHumanLabel = asPimUpdateResourceHumanLabel(createCoreResource());
  pimUpdateResourceHumanLabel.pimResource = operation.forPimResourceIri;
  pimUpdateResourceHumanLabel.pimHumanLabel = operation.label;
  await executor.applyOperation(context.pim, pimUpdateResourceHumanLabel);

  const pimUpdateResourceHumanDescription = asPimUpdateResourceHumanDescription(createCoreResource());
  pimUpdateResourceHumanDescription.pimResource = operation.forPimResourceIri;
  pimUpdateResourceHumanDescription.pimHumanDescription = operation.description;
  await executor.applyOperation(context.pim, pimUpdateResourceHumanDescription);

  executor.commit();
}
