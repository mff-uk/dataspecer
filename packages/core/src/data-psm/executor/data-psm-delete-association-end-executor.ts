import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
} from "../../core";
import { DataPsmDeleteAssociationEnd } from "../operation";
import { removeFromClass } from "./data-psm-executor-utils";

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
