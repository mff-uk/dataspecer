import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { DataPsmSetChoice } from "../operation";
import {
  DataPsmClass,
  DataPsmOr,
} from "../model";
import { DataPsmExecutorResultFactory } from "./data-psm-executor-utils";

export async function executeDataPsmSetChoice(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmSetChoice
): Promise<CoreExecutorResult> {
  const resource = await reader.readResource(operation.dataPsmOr);
  if (resource == null || !DataPsmOr.is(resource)) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm or"
    );
  }

  const newChoice = await reader.readResource(operation.dataPsmChoice);
  if (
    newChoice == null ||
    (!DataPsmClass.is(newChoice))
  ) {
    return DataPsmExecutorResultFactory.invalidType(
      resource,
      "data-psm class"
    );
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...resource,
        dataPsmChoices: [...resource.dataPsmChoices, operation.dataPsmChoice],
      } as DataPsmOr,
    ]
  );
}
