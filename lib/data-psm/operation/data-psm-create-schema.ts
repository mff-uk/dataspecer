import {CoreOperationResult, CoreResource, LanguageString} from "../../core";

export interface DataPsmCreateSchema extends CoreResource {

  /**
   * IRI of the newly created object.
   */
  dataPsmNewIri?: string;

  dataPsmHumanLabel?: LanguageString;

  dataPsmHumanDescription?: LanguageString;

  dataPsmBaseIri?: string;

}

export const DataPsmCreateSchemaType = "psm-action-create-schema";

export function isDataPsmCreateSchema(
  resource: CoreResource,
): resource is DataPsmCreateSchema {
  return resource.types.includes(DataPsmCreateSchemaType);
}

export function asDataPsmCreateSchema(
  resource: CoreResource,
): DataPsmCreateSchema {
  if (isDataPsmCreateSchema(resource)) {
    return resource as DataPsmCreateSchema;
  }
  resource.types.push(DataPsmCreateSchemaType);
  return resource as DataPsmCreateSchema;
}

export interface DataPsmCreateSchemaResult extends CoreOperationResult {

  createdDataPsmSchema: string;

}

export const DataPsmCreateSchemaResultType =
  "psm-action-create-schema-result";

export function isDataPsmCreateSchemaResult(
  resource: CoreOperationResult,
): resource is DataPsmCreateSchemaResult {
  return resource.types.includes(DataPsmCreateSchemaResultType);
}

export function createDataPsmCreateSchemaResultProperties(
  createdDataPsmSchema: string,
) {
  return {
    "types": [DataPsmCreateSchemaResultType],
    "createdDataPsmSchema": createdDataPsmSchema,
  };
}
