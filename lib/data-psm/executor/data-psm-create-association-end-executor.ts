import {
  CoreResourceReader,
  CreateNewIdentifier,
  CoreExecutorResult, CoreResource,
} from "../../core";
import {
  DataPsmCreateAssociationEnd,
} from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmClass,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import {DataPsmAssociationEnd} from "../model";

export async function executeDataPsmCreateAssociationEnd (
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateAssociationEnd,
): Promise<CoreExecutorResult> {

  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  const owner = await loadDataPsmClass(reader, operation.dataPsmOwner);
  if (owner === null) {
    return DataPsmExecutorResultFactory.missingOwner(operation.dataPsmOwner);
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("association");
  const result = new DataPsmAssociationEnd(iri);
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmPart = operation.dataPsmPart;

  return CoreExecutorResult.createSuccess([result], [{
    ...schema,
    "dataPsmParts": [...schema.dataPsmParts, iri],
  } as CoreResource, {
    ...owner,
    "dataPsmParts": [...owner.dataPsmParts, iri],
  } as CoreResource]);
}
