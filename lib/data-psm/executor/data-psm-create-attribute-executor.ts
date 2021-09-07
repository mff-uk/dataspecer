import {
  CoreResourceReader, createCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmCreateAttribute} from "../operation";
import {loadDataPsmClass, loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmAttribute} from "../model";

export async function executesDataPsmCreateAttribute(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmCreateAttribute,
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult("Missing schema object.");
  }

  const owner = await loadDataPsmClass(modelReader, operation.dataPsmOwner);
  if (owner === null) {
    return createErrorOperationResult(
      "Missing owner class: '" + operation.dataPsmOwner + "'.");
  }

  // TODO Check that target exists.

  const iri = operation.dataPsmNewIri || createNewIdentifier("attribute");
  const result = asDataPsmAttribute(createCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmDatatype = operation.dataPsmDatatype;

  owner.dataPsmParts = [...owner.dataPsmParts, iri];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];

  return createSuccessOperationResult( [result], [schema, owner]);
}
