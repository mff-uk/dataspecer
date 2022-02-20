import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmSetInterpretation } from "../operation";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmClass,
} from "../model";

export async function executeDataPsmSetInterpretation(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetInterpretation
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmResource}'.`
    );
  }

  if (!hasInterpretation(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmInterpretation: operation.dataPsmInterpretation,
      } as CoreResource,
    ]
  );
}

function hasInterpretation(resource: CoreResource) {
  return (
    DataPsmAssociationEnd.is(resource) ||
    DataPsmAttribute.is(resource) ||
    DataPsmClass.is(resource)
  );
}
