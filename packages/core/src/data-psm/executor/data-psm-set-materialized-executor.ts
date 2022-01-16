import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import {DataPsmSetMaterialized} from "../operation";
import {DataPsmAssociationEnd} from "../model";
import {DataPsmExecutorResultFactory} from "./data-psm-executor-utils";

export async function executeDataPsmSetMaterialized(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetMaterialized,
): Promise<CoreExecutorResult> {

  const resource = await reader.readResource(operation.dataPsmAssociationEnd);
  if (resource == null || !DataPsmAssociationEnd.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource, "data-psm association end");
  }
  return CoreExecutorResult.createSuccess([], [{
    ...resource,
    "dataPsmIsMaterialized": operation.dataPsmIsMaterialized,
  } as DataPsmAssociationEnd]);
}
