import {PimDeleteAssociation} from "../operation";
import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {
  asPimAssociation,
  isPimAssociation,
} from "../model";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimDeleteAssociation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimDeleteAssociation
): Promise<OperationResult> {
  const associationResource =
    await modelReader.readResource(operation.pimAssociation);
  if (associationResource === undefined) {
    return createErrorOperationResult(
      "Missing association object.")
  }
  if (!isPimAssociation(associationResource)) {
    return createErrorOperationResult(
      "Object to delete is not an association.")
  }
  const associationObject = asPimAssociation(associationResource);

  // We do not check for the ends in here, as this operation may be
  // also used to delete invalid association. We just delete all of it.

  const iriToRemove = [
    operation.iri,
    ...associationObject.pimEnd,
  ];

  const schema = await loadPimSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.")
  }
  schema.pimParts = schema.pimParts.filter(iri => iriToRemove.includes(iri));

  return createSuccessOperationResult(
    [schema], iriToRemove);
}

