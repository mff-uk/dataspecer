import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceHumanLabel} from "../operation";
import {loadDataPsmHumanReadable} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceHumanLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceHumanLabel,
): Promise<CoreExecutorResult> {
  const result =
    await loadDataPsmHumanReadable(modelReader, operation.dataPsmResource);
  if (result === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  return createSuccessOperationResult(
    operation, [], [result]);
}
