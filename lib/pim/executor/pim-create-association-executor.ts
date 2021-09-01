import {
  CoreExecutorResult,
  createErrorOperationResult,
  createSuccessOperationResult,
  CoreResourceReader,
  CreateNewIdentifier,
  createCoreResource,
} from "../../core";
import {
  createPimCreateAssociationResultProperties,
  PimCreateAssociation,
} from "../operation";
import {asPimAssociation, asPimAssociationEnd, isPimClass} from "../model";
import {loadPimSchema} from "./pim-executor-utils";

export async function executesPimCreateAssociation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimCreateAssociation,
): Promise<CoreExecutorResult> {
  const left = asPimAssociationEnd(createCoreResource());
  left.iri = createNewIdentifier("association-end");
  left.pimPart = operation.pimAssociationEnds[0];
  const leftResult = await verityAssociationEnd(
    operation, modelReader, left.pimPart);
  if (leftResult?.failed) {
    return leftResult;
  }

  const right = asPimAssociationEnd(createCoreResource());
  right.iri = createNewIdentifier("association-end");
  right.pimPart = operation.pimAssociationEnds[1];
  const rightResult = await verityAssociationEnd(
    operation, modelReader, right.pimPart);
  if (rightResult?.failed) {
    return leftResult;
  }

  const iri = operation.pimNewIri || createNewIdentifier("association");
  const result = asPimAssociation(createCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  result.pimEnd = [left.iri, right.iri];

  if (operation.pimAssociationEnds.length !== 2) {
    return createErrorOperationResult(
      "Invalid number of ends for an association. Expected " +
      "2 given" + operation.pimAssociationEnds.length + ".");
  }

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult("Missing schema object.");
  }

  schema.pimParts = [...schema.pimParts, result.iri, left.iri, right.iri];

  return createSuccessOperationResult(
    [result, left, right], [schema], [],
    createPimCreateAssociationResultProperties(
      result.iri, [left.iri, right.iri]));
}

async function verityAssociationEnd(
  operation: PimCreateAssociation,
  modelReader: CoreResourceReader,
  iri: string,
): Promise<CoreExecutorResult | undefined> {
  const resource = await modelReader.readResource(iri);
  if (resource === null) {
    return createErrorOperationResult("Missing owner class.");
  }
  if (!isPimClass(resource)) {
    return createErrorOperationResult(
      "Missing association end must be a class.");
  }
  // TODO Check that the association is part of the schema.
  return undefined;
}
