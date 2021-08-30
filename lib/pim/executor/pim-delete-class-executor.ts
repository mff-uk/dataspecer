import {
  CoreResourceReader, createEmptySuccessOperationResult,
  createErrorOperationResult, CreateNewIdentifier,
  createSuccessOperationResult,
  ExecutorResult,
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
): Promise<ExecutorResult> {
  const classResource =
    await modelReader.readResource(operation.pimClass);
  if (classResource === null) {
    return createErrorOperationResult(
      "Missing class object.");
  }
  if (!isPimClass(classResource)) {
    return createErrorOperationResult(
      "Object to delete is not an class.");
  }

  const usageCheck = await checkIsNotUsed(modelReader, operation.pimClass);
  if (usageCheck.failed) {
    return usageCheck;
  }

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      "Missing schema object.");
  }
  schema.pimParts = schema.pimParts.filter(
    iri => iri !== operation.pimClass);

  return createSuccessOperationResult(
    [], [schema], [operation.pimClass]);
}

async function checkIsNotUsed(
  modelReader: CoreResourceReader,
  classIri: string): Promise<ExecutorResult> {
  for (const iri of await modelReader.listResources()) {
    const resource = await modelReader.readResource(iri);
    if (isPimAttribute(resource)) {
      const attributeResource = asPimAttribute(resource);
      if (attributeResource.pimOwnerClass === classIri) {
        return createErrorOperationResult("Class has an attribute.");
      }
    } else if (isPimAssociationEnd(resource)) {
      const associationEndResource = asPimAssociationEnd(resource);
      if (associationEndResource.pimPart === classIri) {
        return createErrorOperationResult("Class is used by an association.");
      }
    }
  }
  return createEmptySuccessOperationResult();
}
