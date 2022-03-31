import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { DataPsmDeleteInclude } from "../operation";
import { removeFromClass } from "./data-psm-executor-utils";

export function executeDataPsmDeleteInclude(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmDeleteInclude
): Promise<CoreExecutorResult> {
  return removeFromClass(
    reader,
    operation.dataPsmOwner,
    operation.dataPsmInclude
  );
}
