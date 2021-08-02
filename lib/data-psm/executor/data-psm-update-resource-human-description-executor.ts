import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateResourceHumanDescription} from "../operation";
import {loadDataPsmHumanReadable} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceHumanDescription(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceHumanDescription,
): Promise<OperationResult> {
  const result =
    await loadDataPsmHumanReadable(modelReader, operation.dataPsmResource);
  if (result === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  return createSuccessOperationResult([result]);
}
