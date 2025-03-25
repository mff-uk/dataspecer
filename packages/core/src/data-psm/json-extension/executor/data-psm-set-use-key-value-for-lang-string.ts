import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier, } from "../../../core";
import { DataPsmExecutorResultFactory } from "../../executor/data-psm-executor-utils";
import { DataPsmAttribute } from "../../model";
import { DataPsmJsonPropertyExtension } from "../model";
import { DataPsmSetUseKeyValueForLangString } from "../operation";
import { JSON_EXTENSION } from "../vocabulary";

export async function executeDataPsmSetUseKeyValueForLangString(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetUseKeyValueForLangString
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmProperty) as DataPsmJsonPropertyExtension;
  if (resource == null || !DataPsmAttribute.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm attribute"
    );
  }
  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        extensions: {
          ...resource?.extensions,
          [JSON_EXTENSION]: {
            ...resource?.extensions?.[JSON_EXTENSION],
            useKeyValueForLangString: !!operation.useKeyValueForLangString,
          }
        }
      } as DataPsmJsonPropertyExtension,
    ]
  );
}
