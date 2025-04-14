import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core/index.ts";
import { DataPsmSchema } from "../model/index.ts";
import { DataPsmSetRootCollection } from "../operation/index.ts";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils.ts";

type RootCollectionType = DataPsmSchema;

export async function executeDataPsmSetRootCollection(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetRootCollection
): Promise<CoreExecutorResult> {
  const resource = (await reader.readResource(operation.entityId)) as RootCollectionType;
  if (!DataPsmSchema.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(resource, "data-psm schema");
  }

  const modifiedEntity: RootCollectionType = {
    ...resource,
    dataPsmCollectionTechnicalLabel: operation.dataPsmCollectionTechnicalLabel,
    dataPsmEnforceCollection: operation.dataPsmEnforceCollection,
  };

  return CoreExecutorResult.createSuccess([], [modifiedEntity]);
}
