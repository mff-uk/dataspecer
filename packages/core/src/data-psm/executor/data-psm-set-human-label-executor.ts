import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core/index.ts";
import { DataPsmSetHumanLabel } from "../operation/index.ts";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmClass,
  DataPsmResource,
  DataPsmSchema,
} from "../model/index.ts";

export async function executeDataPsmSetHumanLabel(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetHumanLabel
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmResource}'.`
    );
  }

  if (!hasHumanLabel(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmHumanLabel: operation.dataPsmHumanLabel,
      } as DataPsmResource,
    ]
  );
}

function hasHumanLabel(resource: CoreResource) {
  return (
    DataPsmAssociationEnd.is(resource) ||
    DataPsmAttribute.is(resource) ||
    DataPsmClass.is(resource) ||
    DataPsmSchema.is(resource)
  );
}
