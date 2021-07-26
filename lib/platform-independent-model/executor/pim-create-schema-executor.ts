import {PimCreateSchema} from "../operation";
import {asPimSchema, PimResourceMap} from "../model";
import {CreateNewIdentifier} from "./pim-executor-api";
import {createEmptyCoreResource} from "../../core";

export async function pimCreateSchemaExecutor(
  createNewIdentifier: CreateNewIdentifier,
  operation: PimCreateSchema): Promise<PimResourceMap> {
  const iri = operation.pimNewIri || createNewIdentifier("schema");

  const result = asPimSchema(createEmptyCoreResource(iri));
  result.pimParts = operation.pimParts;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  return {
    [result.iri]: result,
  };

}