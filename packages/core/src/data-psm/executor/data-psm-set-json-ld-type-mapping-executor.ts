import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";
import { DataPsmClass, DataPsmSchema } from "../model";
import { DataPsmSetJsonLdDefinedTypeMapping } from "../operation";

export async function executeDataPsmSetJsonLdTypeMapping(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetJsonLdDefinedTypeMapping
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
        jsonLdDefinedTypeMapping: operation.jsonLdDefinedTypeMapping,
      } as DataPsmSchema | DataPsmClass,
    ]
  );
}
