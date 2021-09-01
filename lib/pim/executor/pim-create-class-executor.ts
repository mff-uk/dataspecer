import {
  createPimCreateClassResultProperties,
  PimCreateClass
} from "../operation";
import {asPimClass} from "../model";
import {
  createCoreResource,
  createErrorOperationResult,
  createSuccessOperationResult,
  CoreExecutorResult,
  CoreResourceReader,
  CreateNewIdentifier,
} from "../../core";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimCreateClass(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimCreateClass,
): Promise<CoreExecutorResult> {
  const iri = operation.pimNewIri || createNewIdentifier("class");

  const result = asPimClass(createCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }
  schema.pimParts = [...schema.pimParts, result.iri];

  return createSuccessOperationResult(
    operation, [result], [schema], [],
    createPimCreateClassResultProperties(result.iri));
}
