import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmCreateClassReference } from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import { DataPsmClassReference } from "../model";

export async function executeDataPsmCreateClassReference(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateClassReference
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("class-reference");
  const result = new DataPsmClassReference(iri);
  result.dataPsmSpecification = operation.dataPsmSpecification;
  result.dataPsmClass = operation.dataPsmClass;

  return CoreExecutorResult.createSuccess(
    [result],
    [
      {
        ...schema,
        dataPsmParts: [...schema.dataPsmParts, iri],
      } as CoreResource,
    ]
  );
}
