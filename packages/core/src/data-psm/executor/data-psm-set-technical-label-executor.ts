import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmSetTechnicalLabel } from "../operation";
import {
  DataPsmAssociationEnd,
  DataPsmAttribute,
  DataPsmExternalRoot,
  DataPsmClass,
  DataPsmSchema,
} from "../model";

export async function executeDataPsmSetTechnicalLabel(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetTechnicalLabel
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.dataPsmResource}'.`
    );
  }

  if (!hasTechnicalLabel(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmTechnicalLabel: operation.dataPsmTechnicalLabel,
      } as CoreResource,
    ]
  );
}

function hasTechnicalLabel(resource: CoreResource) {
  return (
    DataPsmAssociationEnd.is(resource) ||
    DataPsmAttribute.is(resource) ||
    DataPsmClass.is(resource) ||
    DataPsmSchema.is(resource) ||
    DataPsmExternalRoot.is(resource)
  );
}
