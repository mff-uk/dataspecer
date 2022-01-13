import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import {DataPsmSetDematerialized} from "../operation";
import {DataPsmAssociationEnd} from "../model";
import {DataPsmExecutorResultFactory} from "./data-psm-executor-utils";

export async function executeDataPsmSetDematerialize(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetDematerialized,
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmAssociationEnd);
  if (resource == null || !DataPsmAssociationEnd.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource, "data-psm association end");
  }
  return CoreExecutorResult.createSuccess([], [{
    ...resource,
    "dataPsmIsDematerialize": operation.dataPsmIsDematerialized,
  } as DataPsmAssociationEnd]);
}
