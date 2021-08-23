import {PimCreateAttribute} from "../operation";
import {asPimAttribute} from "../model";
import {
  createCoreResource,
  createErrorOperationResult,
  createSuccessOperationResult,
  OperationResult,
  CoreModelReader,
  CreateNewIdentifier,
} from "../../core";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimCreateAttribute(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimCreateAttribute,
): Promise<OperationResult> {
  const iri = operation.pimNewIri || createNewIdentifier("attribute");

  const result = asPimAttribute(createCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  result.pimOwnerClass = operation.pimOwnerClass;
  result.pimDatatype = operation.pimDatatype;

  const schema = await loadPimSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  schema.pimParts = [...schema.pimParts, result.iri];

  // TODO Check that the class is part of the schema.
  const ownerClass = await modelReader.readResource(
    operation.pimOwnerClass);
  if (ownerClass === undefined) {
    return createErrorOperationResult("Missing owner class");
  }

  return createSuccessOperationResult([result, schema]);
}
