import {PimCreateSchema} from "../operation";
import {asPimSchema} from "../model";
import {
  CoreResourceReader,
  createCoreResource,
  CreateNewIdentifier,
  createSuccessOperationResult,
  ExecutorResult,
} from "../../core";

export async function executePimCreateSchema(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimCreateSchema,
): Promise<ExecutorResult> {
  const iri = operation.pimNewIri || createNewIdentifier("schema");

  const result = asPimSchema(createCoreResource(iri));
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  return createSuccessOperationResult([result], []);
}
