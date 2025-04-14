import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core/index.ts";
import { DataPsmSetRoots } from "../operation/index.ts";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils.ts";

export async function executeDataPsmSetRoots(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetRoots
): Promise<CoreExecutorResult> {
  const resource = await loadDataPsmSchema(reader);
  if (resource === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmRoots: [...operation.dataPsmRoots],
      } as CoreResource,
    ]
  );
}
