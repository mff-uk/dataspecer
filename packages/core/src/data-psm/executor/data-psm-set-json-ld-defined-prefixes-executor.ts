import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core/index.ts";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils.ts";
import { DataPsmClass, DataPsmSchema } from "../model/index.ts";
import { DataPsmSetJsonLdDefinedPrefixes } from "../operation/index.ts";

export async function executeDataPsmSetJsonLdDefinedPrefixes(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetJsonLdDefinedPrefixes
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmEntity);
  if (resource == null || (!DataPsmSchema.is(resource) && !DataPsmClass.is(resource))) {
    return DataPsmExecutorResultFactory.invalidType(resource, "data-psm schema or class");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        jsonLdDefinedPrefixes: operation.jsonLdDefinedPrefixes,
      } as DataPsmSchema | DataPsmClass,
    ]
  );
}
