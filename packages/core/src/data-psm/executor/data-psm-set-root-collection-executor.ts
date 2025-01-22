import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core";
import { DataPsmSchema } from "../model";
import { DataPsmSetRootCollection } from "../operation";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";

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
