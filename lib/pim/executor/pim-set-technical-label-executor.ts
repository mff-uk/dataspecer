import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import {PimSetTechnicalLabel} from "../operation";
import {PimAssociation, PimAttribute, PimClass} from "../model";

export async function executePimSetTechnicalLabel(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetTechnicalLabel,
): Promise<CoreExecutorResult> {

  const resource = await reader.readResource(operation.pimResource);
  if (resource == null) {
    return CoreExecutorResult.createError(
      `Missing data-psm resource '${operation.pimResource}'.`);
  }

  if (!hasTechnicalLabel(resource)) {
    return CoreExecutorResult.createError("Invalid resource type.");
  }

  return CoreExecutorResult.createSuccess([], [{
    ...resource,
    "pimTechnicalLabel": operation.pimTechnicalLabel,
  } as CoreResource]);
}

function hasTechnicalLabel(resource: CoreResource) {
  return PimAssociation.is(resource)
    || PimAttribute.is(resource)
    || PimClass.is(resource);
}