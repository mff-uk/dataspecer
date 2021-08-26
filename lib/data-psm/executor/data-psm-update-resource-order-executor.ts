import {
  CoreModelReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult,
  OperationResult,
} from "../../core";
import {DataPsmUpdateResourceOrder} from "../operation";
import {loadDataPsmClass, loadDataPsmResource} from "./data-psm-executor-utils";

export async function executeDataPsmUpdateResourceOrder(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmUpdateResourceOrder,
): Promise<OperationResult> {
  const resourceToMove =
    await loadDataPsmResource(modelReader, operation.dataPsmResourceToMove);
  if (resourceToMove === undefined) {
    return createErrorOperationResult(
      "Missing resource to move.");
  }

  const resourceToMoveAfter = operation.dataPsmMoveAfter === null ? null :
    await loadDataPsmResource(modelReader, operation.dataPsmMoveAfter);
  if (resourceToMoveAfter === undefined) {
    return createErrorOperationResult(
      "Missing resource to move after.");
  }

  const ownerClass =
    await loadDataPsmClass(modelReader, operation.dataPsmOwnerClass);
  if (ownerClass === undefined) {
    return createErrorOperationResult(
      "Missing class resource.");
  }

  const indexToMove =
    ownerClass.dataPsmParts.indexOf(operation.dataPsmResourceToMove);
  if (indexToMove === -1) {
    return createErrorOperationResult(
      "Resource to move is not part of the class.");
  }
  const partsWithoutTheOneToMove = [
    ...ownerClass.dataPsmParts.slice(0, indexToMove),
    ...ownerClass.dataPsmParts.slice(indexToMove + 1),
  ];

  const indexToMoveAfter = operation.dataPsmMoveAfter === null ? -1 :
    partsWithoutTheOneToMove.indexOf(operation.dataPsmMoveAfter);
  if (indexToMoveAfter === -1 && operation.dataPsmMoveAfter !== null) {
    return createErrorOperationResult(
      "Resource to move after is not part of the class.");
  }
  ownerClass.dataPsmParts = [
    ...partsWithoutTheOneToMove.slice(0, indexToMoveAfter + 1),
    operation.dataPsmResourceToMove,
    ...partsWithoutTheOneToMove.slice(indexToMoveAfter + 1),
  ];

  return createSuccessOperationResult([ownerClass]);
}
