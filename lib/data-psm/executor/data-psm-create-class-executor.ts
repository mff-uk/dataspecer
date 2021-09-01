import {
  CoreResourceReader, createCoreResource, createErrorOperationResult,
  CreateNewIdentifier, createSuccessOperationResult, CoreExecutorResult,
} from "../../core";
import {DataPsmCreateClass} from "../operation";
import {loadDataPsmSchema} from "./data-psm-executor-utils";
import {asDataPsmClass} from "../model";

export async function executesDataPsmCreateClass(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreResourceReader,
  operation: DataPsmCreateClass,
): Promise<CoreExecutorResult> {
  const schema = await loadDataPsmSchema(modelReader);
  if (schema === null) {
    return createErrorOperationResult(
      operation, "Missing schema object.");
  }

  // TODO Check that all extends exists.

  const iri = operation.dataPsmNewIri || createNewIdentifier("class");
  const result = asDataPsmClass(createCoreResource(iri));
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmExtends = operation.dataPsmExtends;
  result.dataPsmParts = [];

  schema.dataPsmParts = [...schema.dataPsmParts, iri];
  return createSuccessOperationResult(
    operation, [result], [schema]);
}
