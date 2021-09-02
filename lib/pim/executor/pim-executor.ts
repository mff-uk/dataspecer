import {
  CoreOperation,
  CreateNewIdentifier,
  CoreResourceReader,
  CoreExecutorResult,
  createErrorOperationResult,
} from "../../core";
import * as Operations from "../operation";
import {executePimCreateSchema} from "./pim-create-schema-executor";
import {executePimCreateClass} from "./pim-create-class-executor";
import {executePimDeleteClass} from "./pim-delete-class-executor";
import {executePimCreateAttribute} from "./pim-create-attribute-executor";
import {executePimDeleteAttribute} from "./pim-delete-attribute-executor";
import {executesPimCreateAssociation} from "./pim-create-association-executor";
import {
  executePimDeleteAssociation,
} from "./pim-delete-association-executor";

export async function executePimOperation(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: CoreOperation,
): Promise<CoreExecutorResult> {
  if (operation.types.length !== 1) {
    return createErrorOperationResult("Invalid operation");
  }
  switch (operation.types[0]) {
    case Operations.PimCreateSchemaType:
      return await executePimCreateSchema(
        createNewIdentifier, modelReader,
        Operations.asPimCreateSchema(operation));
    case Operations.PimCreateClassType:
      return await executePimCreateClass(
        createNewIdentifier, modelReader,
        Operations.asPimCreateClass(operation));
    case Operations.PimDeleteClassType:
      return await executePimDeleteClass(
        createNewIdentifier, modelReader,
        Operations.asPimDeleteClass(operation));
    case Operations.PimCreateAttributeType:
      return await executePimCreateAttribute(
        createNewIdentifier, modelReader,
        Operations.asPimCreateAttribute(operation));
    case Operations.PimDeleteAttributeType:
      return await executePimDeleteAttribute(
        createNewIdentifier, modelReader,
        Operations.asPimDeleteAttribute(operation));
    case Operations.PimCreateAssociationType:
      return await executesPimCreateAssociation(
        createNewIdentifier, modelReader,
        Operations.asPimCreateAssociation(operation));
    case Operations.PimDeleteAssociationType:
      return await executePimDeleteAssociation(
        createNewIdentifier, modelReader,
        Operations.asPimDeleteAssociation(operation));
    default:
      return createErrorOperationResult("Unknown operation");
  }
}
