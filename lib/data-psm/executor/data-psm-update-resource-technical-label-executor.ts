import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateResourceTechnicalLabel} from "../operation";
import {loadDataPsmTechnicalResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceTechnicalLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceTechnicalLabel,
): Promise<OperationResult> {
  const result =
    await loadDataPsmTechnicalResource(modelReader, operation.dataPsmResource);
  if (result === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  return createSuccessOperationResult([result]);
}
