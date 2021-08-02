import {
  CoreModelReader, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmDeleteAssociationEnd} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";

export async function executesDataPsmDeleteAssociationEnd(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmDeleteAssociationEnd,
): Promise<OperationResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  const owner = await loadDataPsmClass(modelReader, operation.dataPsmOwner);
  if (owner === undefined) {
    return createErrorOperationResult(
      "Missing owner class.");
  }

  // TODO Check that deleted resource is part of the class and schema.

  schema.dataPsmParts =
    schema.dataPsmParts.filter(iri => iri !== operation.dataPsmAssociationEnd);

  owner.dataPsmParts =
    owner.dataPsmParts.filter(iri => iri !== operation.dataPsmAssociationEnd);

  return createSuccessOperationResult(
    [schema, owner], [operation.dataPsmAssociationEnd]);
}
