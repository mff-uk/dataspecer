import {PimCreateClass} from "../operation";
import {asPimClass} from "../model";
import {
  createCoreResource,
  createErrorOperationResult,
  createSuccessOperationResult,
  ExecutorResult,
  CoreResourceReader,
  CreateNewIdentifier,
} from "../../core";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimCreateClass(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimCreateClass,
): Promise<ExecutorResult> {
  const iri = operation.pimNewIri || createNewIdentifier("class");

  const result = asPimClass(createCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  schema.pimParts = [...schema.pimParts, result.iri];

  return createSuccessOperationResult([result], [schema]);
}
