import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {PimUpdateResourceHumanLabel} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceHumanLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimUpdateResourceHumanLabel
): Promise<OperationResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === undefined) {
    return createErrorOperationResult(
      "Missing PIM resource.")
  }
  const result = {
    ...psmResource,
    "pimHumanLabel": operation.pimHumanLabel,
  };
  return createSuccessOperationResult([result], []);
}
