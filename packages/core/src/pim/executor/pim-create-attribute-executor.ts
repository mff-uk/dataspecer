import {PimCreateAttribute, PimCreateAttributeResult} from "../operation";
import {PimAttribute, PimClass} from "../model";
import {
  CoreExecutorResult, CoreResource,
  CoreResourceReader,
  CreateNewIdentifier,
} from "../../core";
import {
  loadPimSchema, PimExecutorResultFactory,
} from "./pim-executor-utils";

export async function executePimCreateAttribute(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: PimCreateAttribute,
): Promise<CoreExecutorResult> {

  const schema = await loadPimSchema(reader);
  if (schema === null) {
    return PimExecutorResultFactory.missingSchema();
  }

  const owner = await reader.readResource(operation.pimOwnerClass);
  if (!PimClass.is(owner)) {
    return PimExecutorResultFactory.invalidType(owner, "pim:class");
  }

  const iri = operation.pimNewIri ?? createNewIdentifier("attribute");
  const result = new PimAttribute(iri);
  result.pimInterpretation = operation.pimInterpretation;
  result.pimTechnicalLabel = operation.pimTechnicalLabel;
  result.pimHumanLabel = operation.pimHumanLabel;
  result.pimHumanDescription = operation.pimHumanDescription;
  result.pimOwnerClass = operation.pimOwnerClass;
  result.pimDatatype = operation.pimDatatype;
  result.pimCardinalityMin = operation.pimCardinalityMin;
  result.pimCardinalityMax = operation.pimCardinalityMax;

  return CoreExecutorResult.createSuccess([result], [{
    ...schema,
    "pimParts": [...schema.pimParts, result.iri],
  } as CoreResource], [],
  new PimCreateAttributeResult(result.iri));
}
