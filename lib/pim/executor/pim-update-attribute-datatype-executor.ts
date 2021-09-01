import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {isPimAttribute} from "../model";
import {PimUpdateAttributeDatatype} from "../operation";

export async function executePimUpdateAttributeDataType(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimUpdateAttributeDatatype,
): Promise<CoreExecutorResult> {
  const attributeResource =
    await modelReader.readResource(operation.pimAttribute);
  if (attributeResource === null) {
    return createErrorOperationResult(
      operation, "Missing attribute object.");
  }
  if (!isPimAttribute(attributeResource)) {
    return createErrorOperationResult(
      operation, "Object to is not an attribute.");
  }
  const result = {
    ...attributeResource,
    "pimDatatype": operation.pimDatatype,
  };
  return createSuccessOperationResult(
    operation, [], [result]);
}
