import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { PimAttribute } from "../model";
import { PimSetRegex } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetRegex(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetRegex
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
        pimRegex: operation.pimRegex,
      } as CoreResource,
    ]
  );
}
