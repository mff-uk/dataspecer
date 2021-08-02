import {
  CoreModelReader, createEmptyCoreResource,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmCreateSchema} from "../operation";
import {asDataPsmSchema} from "../model";

export async function executesDataPsmCreateSchema(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmCreateSchema,
): Promise<OperationResult> {
  const iri = operation.dataPsmNewIri || createNewIdentifier("association");
  const result = asDataPsmSchema(createEmptyCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmParts = [];
  result.dataPsmRoots = [];

  return createSuccessOperationResult([result]);
}
