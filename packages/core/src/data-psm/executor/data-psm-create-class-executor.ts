import {
  CoreResourceReader,
  CoreExecutorResult,
  CreateNewIdentifier, CoreResource,
} from "../../core";
import {DataPsmCreateClass} from "../operation";
import {
  DataPsmExecutorResultFactory,
  loadDataPsmSchema,
} from "./data-psm-executor-utils";
import {DataPsmClass} from "../model";

export async function executeDataPsmCreateClass(
  reader: CoreResourceReader,
  createNewIdentifier: CreateNewIdentifier,
  operation: DataPsmCreateClass,
): Promise<CoreExecutorResult> {

  const schema = await loadDataPsmSchema(reader);
  if (schema === null) {
    return DataPsmExecutorResultFactory.missingSchema();
  }

  for (const iri of operation.dataPsmExtends) {
    const resource = await reader.readResource(iri);
    if (!DataPsmClass.is(resource)) {
      return CoreExecutorResult.createError(
        `Missing extended class: '${iri}'`);
    }
  }

  const iri = operation.dataPsmNewIri ?? createNewIdentifier("class");
  const result = new DataPsmClass(iri);
  result.dataPsmHumanLabel = operation.dataPsmHumanLabel;
  result.dataPsmHumanDescription = operation.dataPsmHumanDescription;
  result.dataPsmInterpretation = operation.dataPsmInterpretation;
  result.dataPsmTechnicalLabel = operation.dataPsmTechnicalLabel;
  result.dataPsmExtends = operation.dataPsmExtends;
  result.dataPsmParts = [];

  return CoreExecutorResult.createSuccess([result], [{
    ...schema,
    "dataPsmParts": [...schema.dataPsmParts, iri],
  } as CoreResource]);
}
