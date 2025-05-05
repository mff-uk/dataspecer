import {CoreExecutorResult, CoreResourceReader, CreateNewIdentifier,} from "../../../core/index.ts";
import {DataPsmSchema} from "../../model/index.ts";
import {DataPsmExecutorResultFactory} from "../../executor/data-psm-executor-utils.ts";
import {DataPsmSetNamespaceXmlExtension} from "../operation/index.ts";
import {DataPsmSchemaXmlExtension} from "../model/index.ts";
import {XML_EXTENSION} from "../vocabulary.ts";

export async function executeDataPsmSetNamespaceXmlExtension(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetNamespaceXmlExtension
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
            namespace: operation.namespace,
            namespacePrefix: operation.namespacePrefix,
          }
        }
      } as DataPsmSchemaXmlExtension,
    ]
  );
}
