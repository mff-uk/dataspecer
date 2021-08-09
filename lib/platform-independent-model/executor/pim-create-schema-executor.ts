import {PimCreateSchema} from "../operation";
import {asPimSchema} from "../model";
import {
  CoreModelReader,
  createCoreResource,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult,
} from "../../core";

export async function executePimCreateSchema(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimCreateSchema,
): Promise<OperationResult> {
  const iri = operation.pimNewIri || createNewIdentifier("schema");

  const result = asPimSchema(createCoreResource(iri));
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  return createSuccessOperationResult([result]);
}
