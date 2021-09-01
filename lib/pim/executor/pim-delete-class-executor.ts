import {
  CoreResourceReader,
  createErrorOperationResult, CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {
  asPimAssociationEnd,
  asPimAttribute,
  isPimAssociationEnd,
  isPimAttribute,
  isPimClass,
} from "../model";
import {PimDeleteClass} from "../operation";
import {loadPimSchema} from "./pim-executor-utils";

export async function executePimDeleteClass(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimDeleteClass,
): Promise<CoreExecutorResult> {
  const classResource =
    await modelReader.readResource(operation.pimClass);
  if (classResource === null) {
    return createErrorOperationResult(
      operation, "Missing class object.");
  }
  if (!isPimClass(classResource)) {
    return createErrorOperationResult(
      operation, "Object to delete is not an class.");
  }

  const usageCheck = await checkIsNotUsed(
    operation, modelReader, operation.pimClass);
  if (usageCheck?.failed) {
    return usageCheck;
  }

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }
  schema.pimParts = schema.pimParts.filter(
    iri => iri !== operation.pimClass);

  return createSuccessOperationResult(
    operation, [], [schema], [operation.pimClass]);
}

async function checkIsNotUsed(
  operation: PimDeleteClass,
  modelReader: CoreResourceReader,
  classIri: string): Promise<CoreExecutorResult | undefined> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isPimAttribute(resource)) {
      const attributeResource = asPimAttribute(resource);
      if (attributeResource.pimOwnerClass === classIri) {
        return createErrorOperationResult(
          operation, "Class has an attribute.");
      }
    } else if (isPimAssociationEnd(resource)) {
      const associationEndResource = asPimAssociationEnd(resource);
      if (associationEndResource.pimPart === classIri) {
        return createErrorOperationResult(
          operation, "Class is used by an association.");
      }
    }
  }
  return undefined;
}
