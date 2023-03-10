import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { PimAttribute, PimClass } from "../model";
import { PimSetRegex } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetRegex(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetRegex
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimResource);
  if (!PimAttribute.is(resource) && !PimClass.is(resource)) {
    return PimExecutorResultFactory.invalidType(resource, "pim:attribute | pim:class");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimRegex: operation.pimRegex,
      } as PimAttribute | PimClass,
    ]
  );
}
