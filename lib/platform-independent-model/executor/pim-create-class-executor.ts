import {PimCreateClass} from "../operation";
import {PimResourceMap, asPimClass} from "../model";
import {CreateNewIdentifier} from "./pim-executor-api";
import {createEmptyCoreResource} from "../../core";
import {CoreModelReader} from "../../core/api";
import {loadSchema} from "./pim-executor-utils";

export async function pimCreateClassExecutor(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader, operation: PimCreateClass
): Promise<PimResourceMap> {
  const iri = operation.pimNewIri || createNewIdentifier("class");

  const result = asPimClass(createEmptyCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;

  const schema = await loadSchema(modelReader);
  schema.pimParts = [...schema.pimParts, result.iri];

  return {
    [result.iri]: result,
    [schema.iri]: schema,
  };

}
