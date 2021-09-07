import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {PimUpdateResourceHumanLabel} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceHumanLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateResourceHumanLabel,
): Promise<CoreExecutorResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === null) {
    return createErrorOperationResult("Missing PIM resource.");
  }
  const result = {
    ...psmResource,
    "pimHumanLabel": operation.pimHumanLabel,
  };
  return createSuccessOperationResult([], [result]);
}
