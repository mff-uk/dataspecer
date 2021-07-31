import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {isPimAttribute} from "../model";
import {PimUpdateAttributeDatatype} from "../operation";

export async function executePimUpdateAttributeDataType(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimUpdateAttributeDatatype
): Promise<OperationResult> {
  const attributeResource =
    await modelReader.readResource(operation.pimAttribute);
  if (attributeResource === undefined) {
    return createErrorOperationResult(
      "Missing attribute object.")
  }
  if (!isPimAttribute(attributeResource)) {
    return createErrorOperationResult(
      "Object to is not an attribute.")
  }
  const result = {
    ...attributeResource,
    "pimDatatype": operation.pimDatatype,
  };
  return createSuccessOperationResult([result], []);
}
