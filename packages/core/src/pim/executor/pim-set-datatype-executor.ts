import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { PimAttribute } from "../model";
import { PimSetDatatype } from "../operation";
import { PimExecutorResultFactory } from "./pim-executor-utils";

export async function executePimSetDataType(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimSetDatatype
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
        pimDatatype: operation.pimDatatype,
        pimLanguageStringRequiredLanguages: operation.pimLanguageStringRequiredLanguages,
      } as CoreResource,
    ]
  );
}
