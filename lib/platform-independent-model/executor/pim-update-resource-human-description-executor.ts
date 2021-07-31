import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {PimUpdateResourceHumanDescription} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceHumanDescription(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimUpdateResourceHumanDescription
): Promise<OperationResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === undefined) {
    return createErrorOperationResult(
      "Missing PIM resource.")
  }
  const result = {
    ...psmResource,
    "pimHumanDescription": operation.pimHumanDescription,
  };
  return createSuccessOperationResult([result], []);
}
