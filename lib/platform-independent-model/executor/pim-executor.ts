import {assert} from "../../io/assert";
import {CoreOperation} from "../../core";
import {PimResourceMap} from "../model";
import {CreateNewIdentifier} from "./pim-executor-api";
import {pimCreateClassExecutor} from "./pim-create-class-executor";
import {pimCreateSchemaExecutor} from "./pim-create-schema-executor";
import * as Operations from "../operation";
import {CoreModelReader} from "../../core/api";
import {pimCreateAttributeExecutor} from "./pim-create-attribute-executor";

export async function applyPimOperation(
  createNewIdentifier: CreateNewIdentifier, modelReader: CoreModelReader,
  operation: CoreOperation
): Promise<PimResourceMap> {
  assert(operation.types.length === 1, "Operation must have exactly one type.")
  switch (operation.types[0]) {
    case Operations.PimCreateClassType:
      return await pimCreateClassExecutor(
        createNewIdentifier, modelReader,
        Operations.asPimCreateClass(operation));
    case Operations.PimCreateSchemaType:
      return await pimCreateSchemaExecutor(
        createNewIdentifier, Operations.asPimCreateSchema(operation));
    case Operations.PimCreateAttributeType:
      return await pimCreateAttributeExecutor(
        createNewIdentifier, modelReader,
        Operations.asPimCreateAttribute(operation));
    default:
      throw new Error("Unknown operation types:" + operation.types);
  }
}
