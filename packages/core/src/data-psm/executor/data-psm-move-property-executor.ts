import {
  CoreExecutorResult,
  CoreResourceReader,
  CreateNewIdentifier
} from "../../core";
import { DataPsmClass, DataPsmContainer, DataPsmSchema } from "../model";
import { DataPsmMoveProperty } from "../operation";
import {
  DataPsmExecutorResultFactory
} from "./data-psm-executor-utils";

type containerType = DataPsmClass | DataPsmContainer | DataPsmSchema;

export async function executeDataPsmMoveProperty(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmMoveProperty
): Promise<CoreExecutorResult> {
  const sourceResource = await reader.readResource(
    operation.dataPsmSourceContainer
  );
  if (sourceResource === null) {
    return DataPsmExecutorResultFactory.missing(
      operation.dataPsmSourceContainer
    );
  }
  const resourceToMove = await reader.readResource(
    operation.dataPsmProperty
  );
  if (resourceToMove === null) {
    return DataPsmExecutorResultFactory.missing(
      operation.dataPsmProperty
    );
  }
  const destinationResource = await reader.readResource(
    operation.dataPsmTargetContainer
  );
  if (destinationResource === null) {
    return DataPsmExecutorResultFactory.missing(
      operation.dataPsmTargetContainer
    );
  }

  let sourceContainer: string[];
  if (DataPsmClass.is(sourceResource) ||DataPsmContainer.is(sourceResource)) {
    sourceContainer = sourceResource.dataPsmParts;
  } else if (DataPsmSchema.is(sourceResource)) { // As schema root
    sourceContainer = sourceResource.dataPsmRoots;
  } else {
    return CoreExecutorResult.createError(
      "Source container is not a class, container or schema root."
    );
  }

  let destinationContainer: string[];
  if (DataPsmClass.is(destinationResource) ||DataPsmContainer.is(destinationResource)) {
    destinationContainer = destinationResource.dataPsmParts;
  } else if (DataPsmSchema.is(destinationResource)) { // As schema root
    destinationContainer = destinationResource.dataPsmRoots;
  } else {
    return CoreExecutorResult.createError(
      "Target container is not a class, container or schema root."
    );
  }

  if (!sourceContainer.includes(operation.dataPsmProperty)) {
    return CoreExecutorResult.createError("Property is not part of the source container.");
  }
  if (operation.dataPsmMoveAfter !== null && !destinationContainer.includes(operation.dataPsmMoveAfter)) {
    return CoreExecutorResult.createError("Property to move after is not part of the target container.");
  }

  sourceContainer = sourceContainer.filter((part) => part !== operation.dataPsmProperty);
  destinationContainer = [
    ...destinationContainer.slice(0, operation.dataPsmMoveAfter === null ? 0 : destinationContainer.indexOf(operation.dataPsmMoveAfter) + 1),
    operation.dataPsmProperty,
    ...destinationContainer.slice(operation.dataPsmMoveAfter === null ? 0 : destinationContainer.indexOf(operation.dataPsmMoveAfter) + 1),
  ];

  let source: containerType;
  if (DataPsmClass.is(sourceResource) || DataPsmContainer.is(sourceResource)) {
    source = {
      ...sourceResource,
      dataPsmParts: sourceContainer,
    } satisfies DataPsmClass | DataPsmContainer;
  } else {
    source = {
      ...sourceResource,
      dataPsmRoots: sourceContainer,
    } satisfies DataPsmSchema;
  }

  let destination: containerType;
  if (DataPsmClass.is(destinationResource) || DataPsmContainer.is(destinationResource)) {
    destination = {
      ...destinationResource,
      dataPsmParts: destinationContainer,
    } satisfies DataPsmClass | DataPsmContainer;
  } else {
    destination = {
      ...destinationResource,
      dataPsmRoots: destinationContainer,
    } satisfies DataPsmSchema;
  }

  return CoreExecutorResult.createSuccess([], [source, destination]);
}
