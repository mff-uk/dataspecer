import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {PimUpdateResourceHumanDescription} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceHumanDescription(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateResourceHumanDescription,
): Promise<CoreExecutorResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === null) {
    return createErrorOperationResult(
      operation, "Missing PIM resource.");
  }
  const result = {
    ...psmResource,
    "pimHumanDescription": operation.pimHumanDescription,
  };
  return createSuccessOperationResult(
    operation, [], [result]);
}
