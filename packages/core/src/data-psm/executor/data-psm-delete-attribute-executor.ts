import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core/index.ts";
import { DataPsmDeleteAttribute } from "../operation/index.ts";
import { removeFromClass } from "./data-psm-executor-utils.ts";

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
