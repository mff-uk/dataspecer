import {
  CoreResourceReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmDeleteAssociationEnd} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";

export async function executesDataPsmDeleteAssociationEnd(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmDeleteAssociationEnd,
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }

  const owner = await loadDataPsmClass(modelReader, operation.dataPsmOwner);
  if (owner === null) {
    return createErrorOperationResult(
      operation, "Missing owner class.");
  }

  // TODO Check that deleted resource is part of the class and schema.

  schema.dataPsmParts =
    schema.dataPsmParts.filter(iri => iri !== operation.dataPsmAssociationEnd);

  owner.dataPsmParts =
    owner.dataPsmParts.filter(iri => iri !== operation.dataPsmAssociationEnd);

  return createSuccessOperationResult(
    operation, [], [schema, owner], [operation.dataPsmAssociationEnd]);
}
