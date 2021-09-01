import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceTechnicalLabel} from "../operation";
import {loadDataPsmTechnicalResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceTechnicalLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceTechnicalLabel,
): Promise<CoreExecutorResult> {
  const result =
    await loadDataPsmTechnicalResource(modelReader, operation.dataPsmResource);
  if (result === null) {
    return createErrorOperationResult("Missing schema object.");
  }
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  return createSuccessOperationResult([], [result]);
}
