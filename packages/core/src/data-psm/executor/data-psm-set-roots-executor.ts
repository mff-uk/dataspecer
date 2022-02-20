import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmSetRoots } from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";

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
