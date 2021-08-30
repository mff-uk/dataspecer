import {
  CoreResourceReader,
  createErrorOperationResult,
  CreateNewIdentifier,
  createSuccessOperationResult, ExecutorResult,
} from "../../core";
import {DataPsmUpdateResourceOrder} from "../operation";
import {loadDataPsmClass, loadDataPsmResource} from "./data-psm-executor-utils";
import {DataPsmClass} from "../model";

export async function executeDataPsmUpdateResourceOrder(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmUpdateResourceOrder,
): Promise<ExecutorResult> {
  const resourceToMove =
    await loadDataPsmResource(modelReader, operation.dataPsmResourceToMove);
  if (resourceToMove === null) {
    return createErrorOperationResult(
      "Missing resource to move.");
  }

  const ownerClass =
    await loadDataPsmClass(modelReader, operation.dataPsmOwnerClass);
  if (ownerClass === null) {
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

  if (operation.dataPsmMoveAfter == null) {
    moveToFirstPosition(ownerClass, partsWithoutTheOneToMove, operation);
  } else {
    moveAfter(ownerClass, partsWithoutTheOneToMove, operation);
  }
  return createSuccessOperationResult([], [ownerClass]);
}

function moveToFirstPosition(
  ownerClass: DataPsmClass,
  partsWithoutTheOneToMove: string[],
  operation: DataPsmUpdateResourceOrder
) {
  ownerClass.dataPsmParts = [
    operation.dataPsmResourceToMove,
    ...partsWithoutTheOneToMove
  ];
}

function moveAfter(
  ownerClass: DataPsmClass,
  partsWithoutTheOneToMove: string[],
  operation: DataPsmUpdateResourceOrder
) {
  const indexToMoveAfter =
    partsWithoutTheOneToMove.indexOf(operation.dataPsmMoveAfter);
  if (indexToMoveAfter === -1) {
    return createErrorOperationResult(
      "Resource to move after is not part of the class.");
  }
  ownerClass.dataPsmParts = [
    ...partsWithoutTheOneToMove.slice(0, indexToMoveAfter + 1),
    operation.dataPsmResourceToMove,
    ...partsWithoutTheOneToMove.slice(indexToMoveAfter + 1),
  ];
}
