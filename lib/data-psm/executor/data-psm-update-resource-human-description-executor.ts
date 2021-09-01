import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceHumanDescription} from "../operation";
import {loadDataPsmHumanReadable} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceHumanDescription(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceHumanDescription,
): Promise<CoreExecutorResult> {
  const result =
    await loadDataPsmHumanReadable(modelReader, operation.dataPsmResource);
  if (result === null) {
    return createErrorOperationResult("Missing schema object.");
  }
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  return createSuccessOperationResult([], [result]);
}
