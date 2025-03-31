import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";
import { DataPsmClass, DataPsmSchema } from "../model";
import { DataPsmSetJsonLdDefinedPrefixes } from "../operation";

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
