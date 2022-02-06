import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { DataPsmDeleteAttribute } from "../operation";
import { removeFromClass } from "./data-psm-executor-utils";

export function executeDataPsmDeleteAttribute(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmDeleteAttribute
): Promise<CoreExecutorResult> {
  return removeFromClass(
    reader,
    operation.dataPsmOwner,
    operation.dataPsmAttribute
  );
}
