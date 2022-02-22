import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { PimSetHumanDescription } from "../operation";
import { PimAssociation, PimAttribute, PimClass, PimSchema } from "../model";

export async function executePimSetHumanDescription(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetHumanDescription
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.pimResource}'.`
    );
  }

  if (!hasHumanDescription(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimHumanDescription: operation.pimHumanDescription,
      } as CoreResource,
    ]
  );
}

function hasHumanDescription(resource: CoreResource) {
  return (
    PimAssociation.is(resource) ||
    PimAttribute.is(resource) ||
    PimClass.is(resource) ||
    PimSchema.is(resource)
  );
}
