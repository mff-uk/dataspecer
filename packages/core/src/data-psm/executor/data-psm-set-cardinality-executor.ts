import { CoreExecutorResult, CoreResourceReader, CreateNewIdentifier } from "../../core";
import { DataPsmAssociationEnd, DataPsmAttribute, DataPsmSchema } from "../model";
import { DataPsmSetCardinality } from "../operation";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";

type CardinalityType = DataPsmSchema | DataPsmAttribute | DataPsmAssociationEnd;

export async function executeDataPsmSetCardinality(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetCardinality
): Promise<CoreExecutorResult> {
  const resource = (await reader.readResource(operation.entityId)) as CardinalityType;
  if (!DataPsmSchema.is(resource) && !DataPsmAttribute.is(resource) && !DataPsmAssociationEnd.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(resource, "data-psm schema, attribute or association end");
  }

  const modifiedEntity: CardinalityType = {
    ...resource,
    dataPsmCardinality: operation.dataPsmCardinality,
  };

  return CoreExecutorResult.createSuccess([], [modifiedEntity]);
}
