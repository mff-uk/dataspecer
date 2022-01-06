import {PimDeleteAssociation} from "../operation";
import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier, CoreResource,
} from "../../core";
import {PimExecutorResultFactory, loadPimSchema} from "./pim-executor-utils";
import {PimAssociation} from "../model";

export async function executePimDeleteAssociation(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimDeleteAssociation,
): Promise<CoreExecutorResult> {

  const resource = await reader.readResource(operation.pimAssociation);
  if (resource === null) {
    return PimExecutorResultFactory.missing(operation.pimAssociation);
  }

  if (!PimAssociation.is(resource)) {
    return PimExecutorResultFactory.invalidType(resource, "pim:association");
  }

  // We do not check for the ends in here, as this operation may be
  // also used to delete invalid association. We just delete all of it.
  const iriToRemove = [resource.iri, ...resource.pimEnd];

  const schema = await loadPimSchema(reader);
  if (schema === null) {
    return PimExecutorResultFactory.missingSchema();
  }

  return CoreExecutorResult.createSuccess([], [{
    ...schema,
    "pimParts": schema.pimParts.filter(iri => !iriToRemove.includes(iri)),
  } as CoreResource], iriToRemove);
}
