import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateResourceInterpretation} from "../operation";
import {loadDataPsmResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceInterpretation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceInterpretation,
): Promise<OperationResult> {
  const result =
    await loadDataPsmResource(modelReader, operation.dataPsmResource);
  if (result === undefined) {
    return createErrorOperationResult(
      "Missing resource object.");
  }

  result.dataPsmInterpretation = operation.dataPsmInterpretation;

  return createSuccessOperationResult([result]);
}
