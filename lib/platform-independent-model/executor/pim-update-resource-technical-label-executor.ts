import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {PimUpdateResourceTechnicalLabel} from "../operation";
import {loadPimResource} from "./pim-executor-utils";

export async function executePimUpdateResourceTechnicalLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimUpdateResourceTechnicalLabel
): Promise<OperationResult> {
  const psmResource = await loadPimResource(modelReader, operation.pimResource);
  if (psmResource === undefined) {
    return createErrorOperationResult(
      "Missing PIM resource.")
  }
  const result = {
    ...psmResource,
    "pimTechnicalLabel": operation.pimTechnicalLabel,
  };
  return createSuccessOperationResult([result], []);
}
