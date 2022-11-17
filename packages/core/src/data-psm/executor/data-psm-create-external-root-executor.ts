import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier,
  CoreResource,
} from "../../core";
import { DataPsmCreateExternalRoot } from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import { DataPsmExternalRoot } from "../model";

export async function executeDataPsmCreateExternalRoot(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateExternalRoot
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const iri = /*operation.dataPsmNewIri ??*/ createNewIdentifier("external-root");
  const result = new DataPsmExternalRoot(iri);
  result.dataPsmTypes = operation.dataPsmTypes;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;

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
