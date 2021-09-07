import {
  createPimCreateSchemaResultProperties,
  PimCreateSchema,
} from "../operation";
import {asPimSchema} from "../model";
import {
  CoreResourceReader,
  createCoreResource,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";

export async function executePimCreateSchema(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimCreateSchema,
): Promise<CoreExecutorResult> {
  const iri = operation.pimNewIri || createNewIdentifier("schema");

  const result = asPimSchema(createCoreResource(iri));
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  return createSuccessOperationResult(
    [result], [], [],
    createPimCreateSchemaResultProperties(result.iri));
}
