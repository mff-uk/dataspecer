import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, ExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceInterpretation} from "../operation";
import {loadDataPsmResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceInterpretation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceInterpretation,
): Promise<ExecutorResult> {
  const result =
    await loadDataPsmResource(modelReader, operation.dataPsmResource);
  if (result === null) {
    return createErrorOperationResult(
      "Missing resource object.");
  }

  result.dataPsmInterpretation = operation.dataPsmInterpretation;

  return createSuccessOperationResult([], [result]);
}
