import {PimCreateClass, PimCreateClassResult} from "../operation";
import {
  CoreExecutorResult,
  CoreResourceReader,
  CreateNewIdentifier,
} from "../../core";
import {PimExecutorResultFactory, loadPimSchema} from "./pim-executor-utils";
import {PimClass} from "../model";

export async function executePimCreateClass(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimCreateClass,
): Promise<CoreExecutorResult> {

  const schema = await loadPimSchema(reader);
  if (schema === null) {
    return PimExecutorResultFactory.missingSchema();
  }

  const iri = operation.pimNewIri ?? createNewIdentifier("class");
  const result = new PimClass(iri);
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  result.pimIsCodelist = operation.pimIsCodelist;

  schema.pimParts = [...schema.pimParts, result.iri];

  return CoreExecutorResult.createSuccess(
    [result], [schema], [],
    new PimCreateClassResult(result.iri));
}
