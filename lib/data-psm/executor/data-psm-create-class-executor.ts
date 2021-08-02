import {
  CoreModelReader, createEmptyCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, OperationResult,
} from "../../core";
import {DataPsmCreateClass} from "../operation";
import {loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmClass} from "../model";

export async function executesDataPsmCreateClass(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader,
  operation: DataPsmCreateClass,
): Promise<OperationResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === undefined) {
    return createErrorOperationResult(
      "Missing schema object.");
  }

  // TODO Check that all extends exists.

  const iri = operation.dataPsmNewIri || createNewIdentifier("association");
  const result = asDataPsmClass(createEmptyCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmExtends = operation.dataPsmExtends;
  result.dataPsmParts = [];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];
  return createSuccessOperationResult([schema, result]);
}
