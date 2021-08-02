import {
  CoreModelReader, createEmptyCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmCreateAttribute} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmAttribute} from "../model";

export async function executesDataPsmCreateAttribute(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmCreateAttribute,
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

  // TODO Check that target exists.

  const iri = operation.dataPsmNewIri || createNewIdentifier("attribute");
  const result = asDataPsmAttribute(createEmptyCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmDatatype = operation.dataPsmDatatype;

  owner.dataPsmParts = [...owner.dataPsmParts, iri];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];

  return createSuccessOperationResult([schema, owner, result]);
}
