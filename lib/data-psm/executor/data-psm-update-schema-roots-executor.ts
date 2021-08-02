import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmUpdateSchemaRoots} from "../operation";
import {loadDataPsmSchema} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateSchemaRoots(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateSchemaRoots,
): Promise<OperationResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  // TODO Check that all roots exists.

  schema.dataPsmRoots = [...operation.dataPsmRoots];

  return createSuccessOperationResult([schema]);
}
