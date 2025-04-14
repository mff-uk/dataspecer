import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core/index.ts";
import { DataPsmDeleteClassReference } from "../operation/index.ts";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils.ts";
import { DataPsmClassReference, DataPsmSchema } from "../model/index.ts";

export async function executeDataPsmDeleteClassReference(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmDeleteClassReference
): Promise<CoreExecutorResult> {
  const schema: DataPsmSchema | null = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const resourceToDelete = await reader.readResource(
    operation.dataPsmClassReference
  );
  if (!DataPsmClassReference.is(resourceToDelete)) {
    return CoreExecutorResult.createError(
      `Missing class '${operation.dataPsmClassReference}' to delete.`
    );
  }

  return CoreExecutorResult.createSuccess(
    [],
    [
      {
        ...schema,
        dataPsmParts: removeValue(
          operation.dataPsmClassReference,
          schema.dataPsmParts
        ),
      } as CoreResource,
    ],
    [operation.dataPsmClassReference]
  );
}

function removeValue<T>(valueToRemove: T, array: T[]): T[] {
  return array.filter((value) => value !== valueToRemove);
}
