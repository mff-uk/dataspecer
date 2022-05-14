import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmUnwrapOr, DataPsmUnwrapOrResult,} from "../operation";
import {DataPsmExecutorResultFactory, loadDataPsmSchema,} from "./data-psm-executor-utils";
import {DataPsmAssociationEnd, DataPsmOr, DataPsmSchema} from "../model";

export async function executeDataPsmUnwrapOr(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmUnwrapOr
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const or = await reader.readResource(operation.dataPsmOr) as DataPsmOr;
  if (or.dataPsmChoices.length === 0) {
    return CoreExecutorResult.createError("Data-psm or does not have any choice.");
  }
  if (or.dataPsmChoices.length > 1) {
    return CoreExecutorResult.createError("Data-psm or has multiple choices.");
  }
  const replacement = or.dataPsmChoices[0];

  let owner = await reader.readResource(operation.dataPsmOwner);
  if (owner === null) {
    return CoreExecutorResult.createError("Missing data-psm owner object.");
  }

  if (DataPsmAssociationEnd.is(owner)) {
    if (owner.dataPsmPart !== operation.dataPsmOr) {
      return CoreExecutorResult.createError("Owner (data-psm association end) does not own the OR.");
    }

    owner.dataPsmPart = replacement;
  } else if (DataPsmSchema.is(owner)) {
    // Make the instances same
    owner = schema;
    const ownerAsSchema = owner as DataPsmSchema;

    if (ownerAsSchema.dataPsmRoots[0] !== operation.dataPsmOr) {
      return CoreExecutorResult.createError("Owner (data-psm schema) does not own the OR.");
    }

    ownerAsSchema.dataPsmRoots[0] = replacement;
  } else {
    return CoreExecutorResult.createError("Owner has unsupported type.");
  }

  schema.dataPsmParts = schema.dataPsmParts.filter(p => p !== operation.dataPsmOr);

  const changed = schema === owner ? [schema] : [schema, owner];

  return CoreExecutorResult.createSuccess(
    [],
    changed,
    [operation.dataPsmOr],
    new DataPsmUnwrapOrResult()
  );
}
