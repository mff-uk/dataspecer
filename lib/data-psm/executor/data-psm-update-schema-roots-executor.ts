import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, ExecutorResult,
} from "../../core";
import {DataPsmUpdateSchemaRoots} from "../operation";
import {loadDataPsmSchema} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateSchemaRoots(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateSchemaRoots,
): Promise<ExecutorResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  // TODO Check that all roots exists.

  schema.dataPsmRoots = [...operation.dataPsmRoots];

  return createSuccessOperationResult([], [schema]);
}
