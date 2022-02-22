import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmSetDatatype } from "../operation";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";
import { DataPsmAttribute } from "../model";

export async function executeDataPsmSetDatatype(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetDatatype
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmAttribute);
  if (!DataPsmAttribute.is(resource)) {
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
        dataPsmDatatype: operation.dataPsmDatatype,
      } as CoreResource,
    ]
  );
}
