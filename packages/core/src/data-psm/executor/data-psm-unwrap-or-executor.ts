import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../core";
import {DataPsmUnwrapOr, DataPsmUnwrapOrResult,} from "../operation";
import {DataPsmExecutorResultFactory, loadDataPsmSchema,} from "./data-psm-executor-utils";
import {DataPsmOr, DataPsmSchema} from "../model";
import {replaceObjectInSchema} from "./replace-object-in-schema";

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
  const replacementIri = or.dataPsmChoices[0];

  const changed = await replaceObjectInSchema(schema.iri, operation.dataPsmOr, replacementIri, reader);

  const changedSchema = changed.some(c => c.iri === schema.iri);
  if (changedSchema) {
    changed.map(c => c.iri === schema.iri ? {...c, dataPsmParts: (c as DataPsmSchema).dataPsmParts.filter(p => p !== operation.dataPsmOr)} : c);
  } else {
    changed.push({...schema, dataPsmParts: schema.dataPsmParts.filter(p => p !== operation.dataPsmOr)} as DataPsmSchema);
  }

  return CoreExecutorResult.createSuccess(
    [],
    changed,
    [operation.dataPsmOr],
    new DataPsmUnwrapOrResult()
  );
}
