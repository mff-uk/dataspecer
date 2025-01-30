import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../../core";
import {DataPsmSchema} from "../../model";
import {DataPsmExecutorResultFactory} from "../../executor/data-psm-executor-utils";
import {DataPsmSetXmlSkipRootElement} from "../operation";
import {DataPsmSchemaXmlExtension} from "../model";
import {XML_EXTENSION} from "../vocabulary";

export async function executeDataPsmSetXmlSkipRootElement(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetXmlSkipRootElement
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmSchema);
  if (resource == null || !DataPsmSchema.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm schema"
    );
  }
  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        extensions: {
          ...resource?.extensions,
          [XML_EXTENSION]: {
            ...resource?.extensions?.[XML_EXTENSION],
            skipRootElement: operation.skipRootElement,
          }
        }
      } as DataPsmSchemaXmlExtension,
    ]
  );
}
