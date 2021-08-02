import {
  CoreModelReader, createEmptyCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {
  DataPsmCreateAssociationEnd,
} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmAssociationEnd} from "../model";

export async function executesDataPsmCreateAssociationEnd(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmCreateAssociationEnd,
): Promise<OperationResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  const owner = await loadDataPsmClass(modelReader, operation.dataPsmOwner);
  if (owner === undefined) {
    return createErrorOperationResult(
      "Missing owner class.");
  }

  const iri = operation.dataPsmNewIri || createNewIdentifier("association");
  const result = asDataPsmAssociationEnd(createEmptyCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmPart = operation.dataPsmPart;

  owner.dataPsmParts = [...owner.dataPsmParts, iri];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];

  return createSuccessOperationResult([schema, owner, result]);
}
