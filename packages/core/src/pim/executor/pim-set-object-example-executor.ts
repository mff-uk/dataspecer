import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { PimClass } from "../model";
import { PimSetObjectExample } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetObjectExample(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetObjectExample
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimResource);
  if (!PimClass.is(resource)) {
    return PimExecutorResultFactory.invalidType(resource, "pim:class");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimObjectExample: operation.pimObjectExample,
      } as PimClass,
    ]
  );
}
