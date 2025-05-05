import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core/index.ts";
import { DataPsmDeleteAssociationEnd } from "../operation/index.ts";
import { removeFromClass } from "./data-psm-executor-utils.ts";

export async function executeDataPsmDeleteAssociationEnd(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmDeleteAssociationEnd
): Promise<CoreExecutorResult> {
  return removeFromClass(
    reader,
    operation.dataPsmOwner,
    operation.dataPsmAssociationEnd
  );
}
