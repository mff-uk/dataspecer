import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier, } from "../../../core";
import { DataPsmExecutorResultFactory } from "../../executor/data-psm-executor-utils";
import { DataPsmAssociationEnd, DataPsmAttribute } from "../../model";
import { DataPsmXmlPropertyExtension } from "../model";
import { DataPsmSetIsXmlAttribute } from "../operation";
import { XML_EXTENSION } from "../vocabulary";

export async function executeDataPsmSetIsXmlAttribute(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetIsXmlAttribute
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmProperty) as DataPsmXmlPropertyExtension;
  if (resource == null || (!DataPsmAttribute.is(resource) && DataPsmAssociationEnd.is(resource))) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm attribute or association end"
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
            isAttribute: !!operation.isAttribute,
          }
        }
      } as DataPsmXmlPropertyExtension,
    ]
  );
}
