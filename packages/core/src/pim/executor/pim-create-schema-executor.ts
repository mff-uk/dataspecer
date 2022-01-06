import {PimCreateSchema, PimCreateSchemaResult} from "../operation";
import {
  CoreResourceReader,
  CreateNewIdentifier,
  CoreExecutorResult,
} from "../../core";
import {loadPimSchema} from "./pim-executor-utils";
import {PimSchema} from "../model";

export async function executePimCreateSchema(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimCreateSchema,
): Promise<CoreExecutorResult> {

  const schema = await loadPimSchema(reader);
  if (schema !== null) {
    return CoreExecutorResult.createError(
      `Schema already exists '${schema.iri}'.`);
  }

  const iri = operation.pimNewIri ?? createNewIdentifier("schema");
  const result = new PimSchema(iri);
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  return CoreExecutorResult.createSuccess(
    [result], [], [], new PimCreateSchemaResult(result.iri));
}
