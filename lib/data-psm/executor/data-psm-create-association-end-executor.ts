import {
  CoreResourceReader, createCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, ExecutorResult,
} from "../../core";
import {
  DataPsmCreateAssociationEnd,
} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmAssociationEnd} from "../model";

export async function executesDataPsmCreateAssociationEnd(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmCreateAssociationEnd,
): Promise<ExecutorResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  const owner = await loadDataPsmClass(modelReader, operation.dataPsmOwner);
  if (owner === null) {
    return createErrorOperationResult(
      "Missing owner class.");
  }

  const iri = operation.dataPsmNewIri || createNewIdentifier("association");
  const result = asDataPsmAssociationEnd(createCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmPart = operation.dataPsmPart;

  owner.dataPsmParts = [...owner.dataPsmParts, iri];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];

  return createSuccessOperationResult([result], [schema, owner]);
}
