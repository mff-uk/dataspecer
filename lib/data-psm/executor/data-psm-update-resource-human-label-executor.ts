import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateResourceHumanLabel} from "../operation";
import {loadDataPsmHumanReadable} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceHumanLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceHumanLabel,
): Promise<OperationResult> {
  const result =
    await loadDataPsmHumanReadable(modelReader, operation.dataPsmResource);
  if (result === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  return createSuccessOperationResult([result]);
}
