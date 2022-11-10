import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmSetExternalRootTypes} from "../operation";
import {DataPsmExternalRoot,} from "../model";

export async function executeDataPsmSetExternalRootTypes(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetExternalRootTypes
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmExternalRoot);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmExternalRoot}'.`
    );
  }

  if (!DataPsmExternalRoot.is(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmTypes: operation.dataPsmTypes,
      } as DataPsmExternalRoot,
    ]
  );
}
