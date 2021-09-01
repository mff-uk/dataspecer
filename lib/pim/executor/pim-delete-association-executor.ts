import {PimDeleteAssociation} from "../operation";
import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {
  asPimAssociation,
  isPimAssociation,
} from "../model";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimDeleteAssociation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimDeleteAssociation,
): Promise<CoreExecutorResult> {
  const associationResource =
    await modelReader.readResource(operation.pimAssociation);
  if (associationResource === null) {
    return createErrorOperationResult(
      operation, "Missing association object.");
  }
  if (!isPimAssociation(associationResource)) {
    return createErrorOperationResult(
      operation, "Object to delete is not an association.");
  }
  const associationObject = asPimAssociation(associationResource);

  // We do not check for the ends in here, as this operation may be
  // also used to delete invalid association. We just delete all of it.

  const iriToRemove = [
    associationObject.iri,
    ...associationObject.pimEnd,
  ];

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }
  schema.pimParts = schema.pimParts.filter(iri => !iriToRemove.includes(iri));

  return createSuccessOperationResult(
    operation, [], [schema], iriToRemove);
}
