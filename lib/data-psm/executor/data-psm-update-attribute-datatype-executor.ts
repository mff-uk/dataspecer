import {
  CoreExecutorResult,
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
} from "../../core";
import {DataPsmUpdateAttributeDatatype} from "../operation";
import {loadDataPsmResource} from "./data-psm-executor-utils";
import {isDataPsmAttribute} from "../model";

export async function executeDataPsmUpdateAttributeDatatype(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateAttributeDatatype,
): Promise<CoreExecutorResult> {
  const result =
    await loadDataPsmResource(modelReader, operation.dataPsmAttribute);
  if (result === null || !isDataPsmAttribute(result)) {
    return createErrorOperationResult("Object is not a data psm attribute.");
  }
  result.dataPsmDatatype = operation.dataPsmDatatype;
  return createSuccessOperationResult([], [result]);
}
