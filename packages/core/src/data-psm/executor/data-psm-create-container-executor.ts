import {
  CoreResourceReader,
  CreateNewIdentifier,
  CoreExecutorResult,
  CoreResource,
} from "../../core";
import {
  DataPsmCreateContainer,
  DataPsmCreateContainerResult,
} from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmClass,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import { DataPsmClass, DataPsmContainer } from "../model";

export async function executeDataPsmCreateContainer(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateContainer
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const owner = await loadDataPsmClass(reader, operation.dataPsmOwner);
  if (owner === null) {
    return DataPsmExecutorResultFactory.missingOwner(operation.dataPsmOwner);
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("Container");
  const result = new DataPsmContainer(iri);
  result.dataPsmContainerType = operation.dataPsmContainerType;

  return CoreExecutorResult.createSuccess(
    [result],
    [
      {
        ...schema,
        dataPsmParts: [...schema.dataPsmParts, iri],
      } as CoreResource,
      {
        ...owner,
        dataPsmParts: [...owner.dataPsmParts, iri],
      } as DataPsmClass,
    ],
    [],
    new DataPsmCreateContainerResult(iri)
  );
}
