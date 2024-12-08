import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { DataPsmDeleteContainer } from "../operation";
import { removeFromClass } from "./data-psm-executor-utils";

export function executeDataPsmDeleteContainer(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmDeleteContainer
): Promise<CoreExecutorResult> {
  return removeFromClass(
    reader,
    operation.dataPsmOwner,
    operation.dataPsmContainer
  );
}
