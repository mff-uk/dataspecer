import {
  CoreResourceReader,
  CreateNewIdentifier,
  CoreExecutorResult,
} from "../../core";
import {DataPsmCreateSchema} from "../operation";
import {DataPsmSchema} from "../model";
import {loadDataPsmSchema} from "./data-psm-executor-utils";

export async function executeDataPsmCreateSchema(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateSchema,
): Promise<CoreExecutorResult> {

  const schema = await loadDataPsmSchema(reader);
  if (schema !== null) {
    return CoreExecutorResult.createError(
      `Schema already exists '${schema.iri}'.`);
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("schema");
  const result = new DataPsmSchema(iri);
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmParts = [];
  result.dataPsmRoots = [];

  return CoreExecutorResult.createSuccess([result], []);
}
