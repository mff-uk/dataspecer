import { CoreResourceReader, CoreExecutorResult } from "../../core";
import { DataPsmClass } from "../model";
import { DataPsmSetJsonSchemaPrefixesInIriRegex } from "../operation";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";

export async function executeDataPsmSetJsonSchemaPrefixesInIriRegex(
  reader: CoreResourceReader,
  _: any,
  operation: DataPsmSetJsonSchemaPrefixesInIriRegex
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmResource);
  if (resource === null || !DataPsmClass.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(resource, "data-psm class");
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        jsonSchemaPrefixesInIriRegex: operation.jsonSchemaPrefixesInIriRegex,
      } as DataPsmClass,
    ],
    []
  );
}
