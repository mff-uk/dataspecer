import {PimCreateAttribute} from "../operation";
import {asPimAttribute, PimResourceMap} from "../model";
import {CreateNewIdentifier} from "./pim-executor-api";
import {createEmptyCoreResource} from "../../core";
import {CoreModelReader} from "../../core/api";
import {loadSchema} from "./pim-executor-utils";

export async function pimCreateAttributeExecutor(
  createNewIdentifier: CreateNewIdentifier,
  modelReader: CoreModelReader, operation: PimCreateAttribute
): Promise<PimResourceMap> {
  const iri = operation.pimNewIri || createNewIdentifier("attribute");

  const result = asPimAttribute(createEmptyCoreResource(iri));
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  result.pimOwnerClass = operation.pimOwnerClass;
  result.pimDatatype = operation.pimDatatype;

  const schema = await loadSchema(modelReader);
  schema.pimParts = [...schema.pimParts, result.iri];

  const ownerClass = await modelReader.readResource(operation.pimOwnerClass);
  if (ownerClass === undefined) {
    throw new Error("Missing owner class");
  }

  return {
    [result.iri]: result,
    [schema.iri]: schema,
  };

}


