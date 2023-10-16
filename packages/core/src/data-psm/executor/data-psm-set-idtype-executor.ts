import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmSetIdType} from "../operation";
import {DataPsmClass,} from "../model";

export async function executeDataPsmSetIdType(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetIdType
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmResource}'.`
    );
  }

  if (!DataPsmClass.is(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  const newResource = {
    ...resource,

    jsonIdKeyAlias: operation.jsonIdKeyAlias,
    jsonIdRequired: operation.jsonIdRequired,
    jsonTypeKeyAlias: operation.jsonTypeKeyAlias,
    jsonTypeRequired: operation.jsonTypeRequired,
  };

  if (newResource.jsonIdKeyAlias === undefined) {
    delete newResource.jsonIdKeyAlias;
  }
  if (newResource.jsonIdRequired === undefined) {
    delete newResource.jsonIdRequired;
  }
  if (newResource.jsonTypeKeyAlias === undefined) {
    delete newResource.jsonTypeKeyAlias;
  }
  if (newResource.jsonTypeRequired === undefined) {
    delete newResource.jsonTypeRequired;
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      newResource,
    ]
  );
}