import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmWrapWithOr, DataPsmWrapWithOrResult,} from "../operation";
import {DataPsmExecutorResultFactory, loadDataPsmSchema,} from "./data-psm-executor-utils";
import {DataPsmAssociationEnd, DataPsmOr, DataPsmSchema} from "../model";

export async function executeDataPsmWrapWithOr(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmWrapWithOr
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("or");

  let owner = await reader.readResource(operation.dataPsmOwner);
  if (owner === null) {
    return CoreExecutorResult.createError("Missing data-psm owner object.");
  }

  if (DataPsmAssociationEnd.is(owner)) {
    if (owner.dataPsmPart !== operation.dataPsmChild) {
      return CoreExecutorResult.createError("Owner (data-psm association end) does not own the child.");
    }

    owner.dataPsmPart = iri;
  } else if (DataPsmSchema.is(owner)) {
    // Make the instances same
    owner = schema;
    const ownerAsSchema = owner as DataPsmSchema;

    if (ownerAsSchema.dataPsmRoots[0] !== operation.dataPsmChild) {
      return CoreExecutorResult.createError("Owner (data-psm schema) does not own the child.");
    }

    ownerAsSchema.dataPsmRoots[0] = iri;
  } else {
    return CoreExecutorResult.createError("Owner has unsupported type.");
  }

  const result = new DataPsmOr(iri);
  result.dataPsmChoices = [operation.dataPsmChild];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];

  const changed = schema === owner ? [schema] : [schema, owner];

  return CoreExecutorResult.createSuccess(
    [result],
    changed,
    [],
    new DataPsmWrapWithOrResult(iri)
  );
}
