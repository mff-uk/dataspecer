import {CoreResource, LanguageString} from "../../core";

/**
 * PSM schema point only to root classes. The rest of the diagram is loaded
 * by resolving the referenced entities.
 */
export interface DataPsmSchema extends CoreResource {

  dataPsmHumanLabel?: LanguageString;

  dataPsmHumanDescription?: LanguageString;

  dataPsmTechnicalLabel?: string;

  dataPsmRoots: string[];

  dataPsmParts: string[];

}

export const DataPsmSchemaType = "data-psm-schema";

export function isDataPsmSchema(
  resource: CoreResource
): resource is DataPsmSchema {
  return resource.types.includes(DataPsmSchemaType);
}

export function asDataPsmSchema(
  resource: CoreResource
): DataPsmSchema {
  if (isDataPsmSchema(resource)) {
    return resource as DataPsmSchema;
  }
  resource.types.push(DataPsmSchemaType);
  const result = resource as DataPsmSchema;
  result.dataPsmHumanLabel = result.dataPsmHumanLabel || {};
  result.dataPsmRoots = result.dataPsmRoots || [];
  result.dataPsmParts = result.dataPsmParts || [];
  return result;
}
