import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceInterpretation} from "../operation";
import {loadDataPsmResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceInterpretation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceInterpretation,
): Promise<CoreExecutorResult> {
  const result =
    await loadDataPsmResource(modelReader, operation.dataPsmResource);
  if (result === null) {
    return createErrorOperationResult(
      operation, "Missing resource object.");
  }

  result.dataPsmInterpretation = operation.dataPsmInterpretation;

  return createSuccessOperationResult(
    operation, [], [result]);
}
