import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmSetInstancesHaveIdentity} from "../operation";
import {DataPsmClass,} from "../model";

export async function executeDataPsmSetInstancesHaveIdentity(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetInstancesHaveIdentity
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmClass);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmClass}'.`
    );
  }

  if (!DataPsmClass.is(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        instancesHaveIdentity: operation.instancesHaveIdentity,
      } as DataPsmClass
    ]
  );
}
