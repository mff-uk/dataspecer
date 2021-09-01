import {
  CoreResourceReader, createCoreResource,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmCreateSchema} from "../operation";
import {asDataPsmSchema} from "../model";

export async function executesDataPsmCreateSchema(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmCreateSchema,
): Promise<CoreExecutorResult> {
  const iri = operation.dataPsmNewIri || createNewIdentifier("schema");
  const result = asDataPsmSchema(createCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmParts = [];
  result.dataPsmRoots = [];

  return createSuccessOperationResult([result], []);
}
