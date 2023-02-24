import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { PimAttribute } from "../model";
import { PimSetExample } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetExample(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetExample
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimAttribute);
  if (!PimAttribute.is(resource)) {
    return PimExecutorResultFactory.invalidType(resource, "pim:attribute");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimExample: operation.pimExample,
      } as CoreResource,
    ]
  );
}
