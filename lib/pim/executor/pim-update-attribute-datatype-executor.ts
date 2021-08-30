import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  ExecutorResult,
} from "../../core";
import {isPimAttribute} from "../model";
import {PimUpdateAttributeDatatype} from "../operation";

export async function executePimUpdateAttributeDataType(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateAttributeDatatype,
): Promise<ExecutorResult> {
  const attributeResource =
    await modelReader.readResource(operation.pimAttribute);
  if (attributeResource === null) {
    return createErrorOperationResult(
      "Missing attribute object.");
  }
  if (!isPimAttribute(attributeResource)) {
    return createErrorOperationResult(
      "Object to is not an attribute.");
  }
  const result = {
    ...attributeResource,
    "pimDatatype": operation.pimDatatype,
  };
  return createSuccessOperationResult([], [result]);
}
