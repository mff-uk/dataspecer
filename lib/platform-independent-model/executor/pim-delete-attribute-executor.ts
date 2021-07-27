import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult
} from "../../core";
import {
  isPimAttribute,
} from "../model";
import {loadPimSchema} from "./pim-executor-utils";
import {PimDeleteAttribute} from "../operation";

export async function executePimDeleteAttribute(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: PimDeleteAttribute
): Promise<OperationResult> {
  const attributeResource =
    await modelReader.readResource(operation.pimAttribute);
  if (attributeResource === undefined) {
    return createErrorOperationResult(
      "Missing attribute object.")
  }
  if (!isPimAttribute(attributeResource)) {
    return createErrorOperationResult(
      "Object to delete is not an attribute.")
  }

  const schema = await loadPimSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.")
  }
  schema.pimParts = schema.pimParts.filter(
    iri => iri === operation.pimAttribute);

  return createSuccessOperationResult(
    [schema], [operation.pimAttribute]);
}
