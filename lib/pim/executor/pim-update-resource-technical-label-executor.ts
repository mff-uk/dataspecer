import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  ExecutorResult,
} from "../../core";
import {PimUpdateResourceTechnicalLabel} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceTechnicalLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateResourceTechnicalLabel,
): Promise<ExecutorResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === null) {
    return createErrorOperationResult(
      "Missing PIM resource.");
  }
  const result = {
    ...psmResource,
    "pimTechnicalLabel": operation.pimTechnicalLabel,
  };
  return createSuccessOperationResult([], [result]);
}
