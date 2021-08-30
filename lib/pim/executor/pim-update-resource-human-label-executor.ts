import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  ExecutorResult,
} from "../../core";
import {PimUpdateResourceHumanLabel} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceHumanLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateResourceHumanLabel,
): Promise<ExecutorResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === null) {
    return createErrorOperationResult(
      "Missing PIM resource.");
  }
  const result = {
    ...psmResource,
    "pimHumanLabel": operation.pimHumanLabel,
  };
  return createSuccessOperationResult([], [result]);
}
