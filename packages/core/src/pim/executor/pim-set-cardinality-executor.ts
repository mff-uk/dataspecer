import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { PimAssociationEnd, PimAttribute } from "../model";
import { PimExecutorResultFactory } from "./pim-executor-utils";
import { PimSetCardinality } from "../operation";

export async function executePimSetCardinality(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetCardinality
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.pimResource);
  if (!PimAttribute.is(resource) && !PimAssociationEnd.is(resource)) {
    return PimExecutorResultFactory.invalidType(
      resource,
      "pim:attribute, pim:associationEnd"
    );
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        pimCardinalityMin: operation.pimCardinalityMin,
        pimCardinalityMax: operation.pimCardinalityMax,
      } as PimAttribute | PimAssociationEnd,
    ]
  );
}
