import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { PimAttribute, PimClass } from "../model";
import { PimSetExample } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetExample(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetExample
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimResource);
  if (!PimAttribute.is(resource) && !PimClass.is(resource)) {
    return PimExecutorResultFactory.invalidType(resource, "pim:attribute");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimExample: operation.pimExample,
      } as PimAttribute | PimClass,
    ]
  );
}
