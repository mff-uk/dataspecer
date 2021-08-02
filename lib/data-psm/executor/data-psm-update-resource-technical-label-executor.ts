import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateResourceTechnicalLabel} from "../operation";
import {
  loadDataPsmResource,
} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceTechnicalLabel(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceTechnicalLabel,
): Promise<OperationResult> {
  const result =
    await loadDataPsmResource(modelReader, operation.dataPsmResource);
  if (result === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  return createSuccessOperationResult([result]);
}
