import {
  CoreResourceReader,
  CreateNewIdentifier,
  CoreExecutorResult,
  CoreResource,
} from "../../core";
import {
  DataPsmCreateAttribute,
  DataPsmCreateAttributeResult,
} from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmClass,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import { DataPsmAttribute } from "../model";

export async function executeDataPsmCreateAttribute(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateAttribute
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const owner = await loadDataPsmClass(reader, operation.dataPsmOwner);
  if (owner === null) {
    return DataPsmExecutorResultFactory.missingOwner(operation.dataPsmOwner);
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("attribute");
  const result = new DataPsmAttribute(iri);
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmDatatype = operation.dataPsmDatatype;

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
      } as CoreResource,
    ],
    [],
    new DataPsmCreateAttributeResult(iri)
  );
}
