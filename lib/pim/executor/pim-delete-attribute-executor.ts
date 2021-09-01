import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  CoreExecutorResult,
} from "../../core";
import {
  isPimAttribute,
} from "../model";
import {loadPimSchema} from "./pim-executor-utils";
import {PimDeleteAttribute} from "../operation";

export async function executePimDeleteAttribute(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: PimDeleteAttribute,
): Promise<CoreExecutorResult> {
  const attributeResource =
    await modelReader.readResource(operation.pimAttribute);
  if (attributeResource === null) {
    return createErrorOperationResult(
      operation, "Missing attribute object.");
  }
  if (!isPimAttribute(attributeResource)) {
    return createErrorOperationResult(
      operation, "Object to delete is not an attribute.");
  }

  const schema = await loadPimSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }
  schema.pimParts = schema.pimParts.filter(
    iri => iri !== operation.pimAttribute);

  return createSuccessOperationResult(
    operation, [], [schema], [operation.pimAttribute]);
}
