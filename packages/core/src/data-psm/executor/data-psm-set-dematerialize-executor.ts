import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core/index.ts";
import { DataPsmSetDematerialized } from "../operation/index.ts";
import { DataPsmAssociationEnd } from "../model/index.ts";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils.ts";

export async function executeDataPsmSetDematerialize(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetDematerialized
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmAssociationEnd);
  if (resource == null || !DataPsmAssociationEnd.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm association end"
    );
  }
  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmIsDematerialize: operation.dataPsmIsDematerialized,
      } as DataPsmAssociationEnd,
    ]
  );
}
